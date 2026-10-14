// Assertions follow Base UI v1.9.0 packages/react/src/popover/**/*.test.tsx
// and packages/react/test/viewportConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverTriggersHarness from '../../tests/PopoverTriggersHarness.svelte';
import { Popover, type PopoverChangeEventDetails } from './index.js';

function recordOpenChanges() {
	const calls: [boolean, string | null][] = [];
	const onOpenChange = vi.fn((open: boolean, details: PopoverChangeEventDetails) => {
		calls.push([open, details.reason]);
	});
	return { calls, onOpenChange };
}

function content() {
	return document.querySelector('[data-testid="content"]')?.textContent ?? null;
}

describe('shadow DOM', () => {
	it('switches triggers without a focus-out close when pressing inside a trigger’s shadow root', async () => {
		const { calls, onOpenChange } = recordOpenChanges();
		render(PopoverTriggersHarness, {
			triggers: [
				{ id: 'trigger-1', label: 'Trigger 1', payload: 1 },
				{ id: 'trigger-2', label: 'Trigger 2', payload: 2, shadowHost: true }
			],
			onOpenChange
		});
		const host = page.getByTestId('shadow-host-trigger-2').element();
		host.attachShadow({ mode: 'open' }).innerHTML = '<b data-testid="shadow-inner">Inner</b>';

		await page.getByRole('button', { name: 'Trigger 1' }).click();
		await expect.element(page.getByTestId('input-inside')).toHaveFocus();

		await page.getByTestId('shadow-inner').click();
		await expect.poll(content).toBe('2');
		expect(calls).toEqual([
			[true, 'trigger-press'],
			[true, 'trigger-press']
		]);
	});
});

describe('focus manager', () => {
	it('closes on the outside press, not on focus out, when another popover’s trigger is pressed inside its shadow root', async () => {
		const first = recordOpenChanges();
		render(PopoverTriggersHarness, {
			triggers: [{ id: 'first', label: 'First', payload: 1 }],
			onOpenChange: first.onOpenChange
		});
		render(PopoverTriggersHarness, {
			triggers: [{ id: 'second', label: 'Second', payload: 2, shadowHost: true }],
			inside: false
		});
		const host = page.getByTestId('shadow-host-second').element();
		host.attachShadow({ mode: 'open' }).innerHTML = '<b data-testid="shadow-inner">Inner</b>';

		await page.getByRole('button', { name: 'First' }).click();
		await expect.element(page.getByTestId('input-inside')).toHaveFocus();

		await page.getByTestId('shadow-inner').click();
		await expect.poll(() => first.calls.length).toBe(2);
		expect(first.calls).toEqual([
			[true, 'trigger-press'],
			[false, 'outside-press']
		]);
	});

	it('returns focus to the bound trigger, not the trigger of an earlier open, after an open without an interaction', async () => {
		const view = render(PopoverTriggersHarness, {
			triggers: [
				{ id: 't1', label: 'Trigger 1', payload: 1 },
				{ id: 't2', label: 'Trigger 2', payload: 2 }
			],
			inside: false,
			keepMounted: true
		});
		const trigger1 = page.getByRole('button', { name: 'Trigger 1' });
		await trigger1.click();
		await expect.element(trigger1).toHaveAttribute('aria-expanded', 'true');
		await trigger1.click();
		await expect.element(trigger1).toHaveAttribute('aria-expanded', 'false');
		(document.activeElement as HTMLElement).blur();
		expect(document.activeElement).toBe(document.body);

		await view.rerender({ triggerId: 't2', open: true });
		await expect.poll(content).toBe('2');
		await expect.poll(() => document.activeElement).toBe(page.getByTestId('popup').element());
		await userEvent.keyboard('{Escape}');

		await expect
			.element(page.getByRole('button', { name: 'Trigger 2' }))
			.toHaveAttribute('aria-expanded', 'false');
		expect(document.activeElement).toBe(page.getByRole('button', { name: 'Trigger 2' }).element());
	});
});

describe('hover', () => {
	it('closes when hovering a disabled trigger while another trigger is open', async () => {
		render(PopoverTriggersHarness, {
			triggers: [
				{ id: 'trigger-1', label: 'Trigger 1', payload: 1, openOnHover: true },
				{ id: 'trigger-2', label: 'Trigger 2', payload: 2, openOnHover: true, disabled: true }
			],
			inside: false
		});
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.element(page.getByTestId('popup')).toBeVisible();
		await page.getByRole('button', { name: 'Trigger 2' }).hover({ force: true });
		await expect.poll(() => document.querySelector('[data-testid="popup"]')).toBeNull();
		await expect
			.element(page.getByRole('button', { name: 'Trigger 2' }))
			.not.toHaveAttribute('data-popup-open');
	});

	it('stays open after leaving when a nested popup trigger was pressed inside its shadow root', async () => {
		const { calls, onOpenChange } = recordOpenChanges();
		render(PopoverTriggersHarness, {
			triggers: [{ id: 'trigger-1', label: 'Trigger 1', payload: 1, openOnHover: true }],
			before: true,
			onOpenChange
		});
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.element(page.getByTestId('popup')).toBeVisible();
		const nested = document.createElement('button');
		nested.setAttribute('aria-haspopup', 'menu');
		const host = document.createElement('span');
		nested.append(host);
		host.attachShadow({ mode: 'open' }).innerHTML = '<b data-testid="shadow-inner">Inner</b>';
		page.getByTestId('popup').element().append(nested);

		await page.getByTestId('shadow-inner').click();
		await page.getByTestId('before').hover();
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(calls).toEqual([[true, 'trigger-hover']]);
		await expect.element(page.getByTestId('popup')).toBeVisible();
	});
});

describe('opened without a trigger (Base UI v1.9.0)', () => {
	const lone = [{ id: 'trigger-1', label: 'Trigger 1', payload: 1 }];

	function trigger() {
		return page.getByRole('button', { name: 'Trigger 1' });
	}

	async function expectUnassociatedTrigger() {
		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
		await expect.element(trigger()).not.toHaveAttribute('aria-controls');
		await expect.element(trigger()).not.toHaveAttribute('data-popup-open');
	}

	async function frame() {
		await new Promise((resolve) => requestAnimationFrame(resolve));
	}

	it('does not associate the only rendered trigger when opened through the handle without a trigger', async () => {
		const handle = Popover.createHandle<number | string>();
		render(PopoverTriggersHarness, { handle, triggers: lone });

		handle.open(null);
		await expect.element(page.getByTestId('popup')).toBeVisible();
		await frame();
		expect(content()).toBe('');
		await expectUnassociatedTrigger();

		handle.close();
		await expect.poll(() => document.querySelector('[data-testid="popup"]')).toBeNull();
		await trigger().click();
		await expect.poll(content).toBe('1');
		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
		await expect
			.element(trigger())
			.toHaveAttribute('aria-controls', page.getByTestId('popup').element().id);
	});

	it('does not let a trigger that mounts while open claim the popup', async () => {
		const handle = Popover.createHandle<number | string>();
		const view = render(PopoverTriggersHarness, { handle, triggers: [] });

		handle.open(null);
		await expect.element(page.getByTestId('popup')).toBeVisible();
		await view.rerender({ triggers: lone });
		await expect.element(trigger()).toBeInTheDocument();
		await frame();
		expect(content()).toBe('');
		await expectUnassociatedTrigger();
	});

	it('takes the payload of the only trigger when opened through bind:open', async () => {
		const handle = Popover.createHandle<number | string>();
		const view = render(PopoverTriggersHarness, { handle, triggers: lone });

		await view.rerender({ open: true });
		await expect.poll(content).toBe('1');
		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
	});

	it('keeps forwarding the only trigger payload while a bind:open popover animates out', async () => {
		const view = render(PopoverTriggersHarness, {
			triggers: lone,
			popupClass: 'exit-popup',
			css: '.exit-popup { transition: opacity 300ms; } .exit-popup[data-ending-style] { opacity: 0; }'
		});
		await view.rerender({ open: true });
		await expect.poll(content).toBe('1');

		await view.rerender({ open: false });
		await expect
			.poll(() =>
				document.querySelector('[data-testid="popup"]')?.hasAttribute('data-ending-style')
			)
			.toBe(true);
		expect(content()).toBe('1');
	});

	it('claims the only trigger on a bind:open after the parent cleared triggerId', async () => {
		const view = render(PopoverTriggersHarness, { triggers: lone });
		await view.rerender({ open: true });
		await expect.poll(content).toBe('1');
		await view.rerender({ open: false, triggerId: null });
		await expect.poll(() => document.querySelector('[data-testid="popup"]')).toBeNull();

		await view.rerender({ open: true });
		await expect.poll(content).toBe('1');
		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
		const anchor = trigger().element().getBoundingClientRect();
		await expect
			.poll(() => page.getByTestId('positioner').element().getBoundingClientRect().top)
			.toBe(anchor.bottom);
	});

	it('takes the only trigger payload on a bind:open after an open without a trigger closed', async () => {
		const handle = Popover.createHandle<number | string>();
		const view = render(PopoverTriggersHarness, { handle, triggers: lone });

		handle.open(null);
		await expect.element(page.getByTestId('popup')).toBeVisible();
		handle.close();
		await expect.poll(() => document.querySelector('[data-testid="popup"]')).toBeNull();

		await view.rerender({ open: true });
		await expect.poll(content).toBe('1');
		await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
	});
});

describe('trigger switch transition (Base UI v1.9.0)', () => {
	function switchCss(switchDuration: number, exitDuration: number) {
		return `
			.switch-positioner {
				transition: top ${switchDuration}ms linear, left ${switchDuration}ms linear,
					transform ${switchDuration}ms linear;
			}
			.switch-popup { opacity: 1; transition: opacity ${exitDuration}ms linear; }
			.switch-popup[data-ending-style] { opacity: 0; }
			.switch-positioner[data-instant], .switch-popup[data-instant] { transition: none; }
		`;
	}

	function popup() {
		return document.querySelector<HTMLElement>('[data-testid="popup"]');
	}

	/** The `data-instant` value of every popup mutation while it is ending. */
	function recordEndingInstants() {
		const instants: (string | null)[] = [];
		const observer = new MutationObserver(() => {
			const element = popup();
			if (element?.hasAttribute('data-ending-style')) {
				instants.push(element.getAttribute('data-instant'));
			}
		});
		observer.observe(document.body, { subtree: true, attributes: true, childList: true });
		return { instants, stop: () => observer.disconnect() };
	}

	function hoverTriggers(
		props: Record<string, unknown> = {},
		{ switchDuration = 120, exitDuration = 250 } = {}
	) {
		return render(PopoverTriggersHarness, {
			triggers: [
				{
					id: 'trigger-1',
					label: 'Trigger 1',
					payload: 1,
					openOnHover: true,
					style: 'position: absolute; top: 20px; left: 20px'
				},
				{
					id: 'trigger-2',
					label: 'Trigger 2',
					payload: 2,
					openOnHover: true,
					style: 'position: absolute; top: 20px; left: 220px'
				}
			],
			inside: false,
			positionerClass: 'switch-positioner',
			popupClass: 'switch-popup',
			css: switchCss(switchDuration, exitDuration),
			...props
		});
	}

	/** Hovers Trigger 1, then Trigger 2, and records the instants of the close that follows. */
	async function switchHoverTriggers({ settleTriggerChange = true, close = false } = {}) {
		hoverTriggers({ close });
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.poll(content).toBe('1');
		await page.getByRole('button', { name: 'Trigger 2' }).hover();
		await expect.poll(content).toBe('2');
		if (settleTriggerChange) {
			await expect.poll(() => popup()?.getAttribute('data-instant')).toBe('trigger-change');
		}
		return recordEndingInstants();
	}

	it('does not apply the trigger-change instant to a hover close after switching triggers', async () => {
		const ending = await switchHoverTriggers();
		await userEvent.unhover(page.getByRole('button', { name: 'Trigger 2' }));
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
		ending.stop();
		expect(ending.instants.length).toBeGreaterThan(0);
		expect(ending.instants).not.toContain('trigger-change');
	});

	it('does not apply the trigger-change instant to a non-hover close after switching triggers', async () => {
		const ending = await switchHoverTriggers({ close: true });
		(page.getByRole('button', { name: 'Close' }).element() as HTMLElement).click();
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
		ending.stop();
		expect(ending.instants.length).toBeGreaterThan(0);
		expect(ending.instants).not.toContain('trigger-change');
	});

	it('does not apply the trigger-change instant after switching back to the original trigger', async () => {
		const first = await switchHoverTriggers();
		first.stop();
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.poll(content).toBe('1');
		await expect.poll(() => popup()?.getAttribute('data-instant')).toBe('trigger-change');
		const ending = recordEndingInstants();
		await userEvent.unhover(page.getByRole('button', { name: 'Trigger 1' }));
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
		ending.stop();
		expect(ending.instants.length).toBeGreaterThan(0);
		expect(ending.instants).not.toContain('trigger-change');
	});

	it('does not restore the trigger-change instant after a hover close has started', async () => {
		const ending = await switchHoverTriggers({ settleTriggerChange: false });
		ending.stop();
		const positioner = page.getByTestId('positioner').element();
		await expect.poll(() => positioner.getAnimations().length).toBeGreaterThan(0);
		const switchAnimations = positioner.getAnimations();
		const closing = popup();

		await userEvent.unhover(page.getByRole('button', { name: 'Trigger 2' }));
		await expect.poll(() => closing?.hasAttribute('data-ending-style')).toBe(true);
		// Finished explicitly: a busy runner can stall the transition past the test timeout.
		switchAnimations.forEach((animation) => animation.finish());
		await new Promise((resolve) => setTimeout(resolve));

		expect(popup()).toBe(closing);
		expect(closing?.hasAttribute('data-ending-style')).toBe(true);
		expect(closing?.hasAttribute('data-instant')).toBe(false);
	});

	describe('after the popup unmounts', () => {
		function twoTriggers() {
			return render(PopoverTriggersHarness, {
				triggers: [
					{ id: 't1', label: 'Trigger 1', payload: 1 },
					{ id: 't2', label: 'Trigger 2', payload: 2 }
				],
				inside: false
			});
		}

		async function openAndUnmountFromTrigger1() {
			await page.getByRole('button', { name: 'Trigger 1' }).click();
			await expect.poll(content).toBe('1');
			await userEvent.keyboard('{Escape}');
			await expect.poll(popup).toBeNull();
		}

		it('does not mark a pointer open from another trigger as a trigger change', async () => {
			twoTriggers();
			await openAndUnmountFromTrigger1();
			await page.getByRole('button', { name: 'Trigger 2' }).click();
			await expect.poll(content).toBe('2');
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(popup()?.getAttribute('data-instant')).toBe(null);
		});

		it('keeps the click instant on a keyboard open from another trigger', async () => {
			twoTriggers();
			await openAndUnmountFromTrigger1();
			page.getByRole('button', { name: 'Trigger 2' }).element().focus();
			await userEvent.keyboard('{Enter}');
			await expect.poll(content).toBe('2');
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(popup()?.getAttribute('data-instant')).toBe('click');
		});
	});

	it('does not restore the trigger-change instant after a reopen on the same trigger', async () => {
		hoverTriggers({}, { switchDuration: 500, exitDuration: 400 });
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.poll(content).toBe('1');
		await page.getByRole('button', { name: 'Trigger 2' }).hover();
		await expect.poll(content).toBe('2');
		await userEvent.unhover(page.getByRole('button', { name: 'Trigger 2' }));
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
		await page.getByRole('button', { name: 'Trigger 2' }).hover();
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(false);
		const reopened = popup();
		await new Promise((resolve) => setTimeout(resolve, 650));
		expect(popup()).toBe(reopened);
		expect(reopened?.hasAttribute('data-instant')).toBe(false);
	});

	it('does not apply the trigger-change instant to a prop-driven close after a switch', async () => {
		const view = render(PopoverTriggersHarness, {
			triggers: [
				{ id: 't1', label: 'Trigger 1', style: 'position: absolute; top: 80px; left: 20px' },
				{ id: 't2', label: 'Trigger 2', style: 'position: absolute; top: 80px; left: 220px' }
			],
			inside: false,
			positionerClass: 'switch-positioner',
			popupClass: 'switch-popup',
			css: switchCss(300, 400)
		});
		await page.getByRole('button', { name: 'Trigger 1' }).click();
		await expect.poll(popup).not.toBeNull();
		await new Promise((resolve) => setTimeout(resolve, 100));

		await view.rerender({ triggerId: 't2' });
		await expect.poll(() => popup()?.getAttribute('data-instant')).toBe('trigger-change');

		const ending = recordEndingInstants();
		await view.rerender({ open: false });
		await expect.poll(() => ending.instants.length, { timeout: 2000 }).toBeGreaterThan(0);
		ending.stop();
		expect(ending.instants).not.toContain('trigger-change');

		await expect.poll(popup, { timeout: 2000 }).toBeNull();
		await view.rerender({ open: true });
		await expect.poll(popup).not.toBeNull();
		expect(popup()?.hasAttribute('data-instant')).toBe(false);
	});

	it('does not restore the trigger-change instant when a bound close commits late', async () => {
		const opened: (string | undefined)[] = [];
		const view = hoverTriggers(
			{
				onOpenChange(next: boolean, details: PopoverChangeEventDetails) {
					if (next) {
						opened.push(details.trigger?.id);
						return;
					}
					details.cancel();
					setTimeout(() => void view.rerender({ open: false }), 400);
				}
			},
			{ switchDuration: 200 }
		);
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.poll(content).toBe('1');
		await new Promise((resolve) => setTimeout(resolve, 100));
		const ending = recordEndingInstants();
		let pending: (string | null)[] = [];
		const pendingObserver = new MutationObserver(() => {
			const element = popup();
			if (element && !element.hasAttribute('data-ending-style')) {
				pending.push(element.getAttribute('data-instant'));
			}
		});
		await page.getByRole('button', { name: 'Trigger 2' }).hover();
		pending = [];
		pendingObserver.observe(document.body, { subtree: true, attributes: true });
		await userEvent.unhover(page.getByRole('button', { name: 'Trigger 2' }));
		await expect.poll(() => ending.instants.length, { timeout: 2000 }).toBeGreaterThan(0);
		ending.stop();
		pendingObserver.disconnect();
		expect(opened).toEqual(['trigger-1', 'trigger-2']);
		expect(pending).toContain('trigger-change');
		expect(ending.instants).not.toContain('trigger-change');
	});
});

describe('viewport (Base UI v1.9.0)', () => {
	it('sets --popup-width and --popup-height on the previous container', async () => {
		render(PopoverTriggersHarness, {
			triggers: [
				{ id: 'trigger-1', label: 'Trigger 1', payload: 0 },
				{ id: 'trigger-2', label: 'Trigger 2', payload: 1 }
			],
			inside: false,
			viewport: true,
			css: '[data-current], [data-previous] { transition: opacity 300ms; } [data-starting-style], [data-ending-style] { opacity: 0; }'
		});
		await page.getByRole('button', { name: 'Trigger 1' }).click();
		await expect.poll(content).toBe('Content 0');
		const { width, height } = getComputedStyle(page.getByTestId('popup').element());

		await page.getByRole('button', { name: 'Trigger 2' }).click();
		const previous = () => document.querySelector<HTMLElement>('[data-previous]');
		await expect.poll(previous).not.toBeNull();
		expect(previous()!.textContent).toBe('Content 0');
		expect(previous()!.style.getPropertyValue('--popup-width')).toBe(width);
		expect(previous()!.style.getPropertyValue('--popup-height')).toBe(height);
	});
});
