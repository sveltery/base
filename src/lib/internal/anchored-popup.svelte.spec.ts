import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AnchoredPopupHarness from '../../tests/AnchoredPopupHarness.svelte';
import AnchoredScrollLockHarness from '../../tests/AnchoredScrollLockHarness.svelte';
import TriggerFocusGuardHarness from '../../tests/TriggerFocusGuardHarness.svelte';

function overflowLocked() {
	return (
		document.documentElement.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

describe('anchored popup', () => {
	it('places the popup under the trigger and locks scroll for a pointer open', async () => {
		render(AnchoredPopupHarness, { scenario: 'placed' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const positioner = page.getByTestId('positioner');
		await expect.element(positioner).toHaveAttribute('data-positioned', '');
		await expect.element(positioner).toHaveAttribute('data-side', 'bottom');
		await expect
			.poll(() => {
				const triggerBox = trigger.element().getBoundingClientRect();
				const popupBox = positioner.element().getBoundingClientRect();
				return popupBox.top >= triggerBox.bottom - 1 && popupBox.left >= triggerBox.left - 1;
			})
			.toBe(true);
		await expect.poll(overflowLocked).toBe(true);
	});

	it('opens on hover, stays open over the popup, and does not lock scroll', async () => {
		render(AnchoredPopupHarness, { scenario: 'hover' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.hover();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		await expect.poll(overflowLocked).toBe(false);
		await popup.hover();
		await expect.element(popup).toBeVisible();
		await page.getByTestId('outside').hover();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
	});

	it('moves focus from the guards to the tabbable neighbors', async () => {
		render(TriggerFocusGuardHarness);
		const open = page.getByRole('button', { name: 'Open' });
		await open.click();
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('true');

		await page.getByRole('button', { name: 'After' }).click();
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByTestId('before-content').element());
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('true');

		await userEvent.keyboard('{Tab}');
		await expect
			.poll(() => document.activeElement)
			.toBe(page.getByRole('button', { name: 'After' }).element());
		await expect.poll(() => page.getByTestId('open').element().textContent).toBe('false');
	});

	function clickTrigger(pointerType: string | null, detail: number) {
		const button = page.getByRole('button', { name: 'Open' }).element();
		if (pointerType) {
			button.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType })
			);
		}
		button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail }));
	}

	it('locks a touch-opened popup only when it is nearly as wide as the viewport', async () => {
		function touchOpen() {
			clickTrigger('touch', 1);
		}

		const narrow = render(AnchoredScrollLockHarness, { enabled: true, wide: false });
		touchOpen();
		await expect.poll(overflowLocked).toBe(false);
		narrow.unmount();

		render(AnchoredScrollLockHarness, { enabled: true, wide: true });
		touchOpen();
		await expect.poll(overflowLocked).toBe(true);
	});

	it('does not keep a touch open after the popup closes', async () => {
		render(AnchoredScrollLockHarness, { enabled: true, wide: false });
		clickTrigger('touch', 1);
		await expect.poll(overflowLocked).toBe(false);
		clickTrigger(null, 1);
		await expect.poll(overflowLocked).toBe(false);
		clickTrigger(null, 0);
		await expect.poll(overflowLocked).toBe(true);
	});

	it('treats a virtual click as keyboard', async () => {
		render(AnchoredScrollLockHarness, { enabled: true, wide: false });
		clickTrigger(null, 0);
		await expect.poll(overflowLocked).toBe(true);
	});

	it('does not reuse the previous coordinates when the same trigger opens again', async () => {
		render(AnchoredPopupHarness, { scenario: 'reopen' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-positioned', '');
		await trigger.click();
		await expect.poll(() => page.getByTestId('positioner').elements().length).toBe(0);
		trigger.element().style.top = '320px';
		await trigger.click();
		await expect
			.poll(() => (page.getByTestId('frames').element().textContent ?? '').trim())
			.toContain('placed');
		const frames = (page.getByTestId('frames').element().textContent ?? '').trim().split(/\s+/);
		const closedAt = frames.lastIndexOf('closed');
		expect(frames[closedAt + 1]).toBe('pending');
	});

	it('reuses the popup and positioner when a click switches triggers', async () => {
		render(AnchoredPopupHarness, { scenario: 'retain' });
		await page.getByRole('button', { name: 'A' }).click();
		const popup = page.getByTestId('popup').element();
		const positioner = page.getByTestId('positioner').element();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await page.getByRole('button', { name: 'B' }).click();
		await expect.poll(() => page.getByTestId('active').element().textContent).toBe('trigger-b');
		expect(page.getByTestId('popup').element()).toBe(popup);
		expect(page.getByTestId('positioner').element()).toBe(positioner);
		expect(page.getByRole('dialog', { name: 'Notice' }).elements()).toHaveLength(1);
	});

	it('blocks pointer events outside the safe polygon when asked', async () => {
		const view = render(AnchoredPopupHarness, { scenario: 'block' });
		await page.getByRole('button', { name: 'Open' }).hover();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await expect.poll(() => document.body.style.pointerEvents).toBe('none');
		view.unmount();
		expect(document.body.style.pointerEvents).not.toBe('none');
	});

	it('switches to the trigger under the pointer and leaves a refused trigger alone', async () => {
		const switched = render(AnchoredPopupHarness, { scenario: 'switch' });
		const first = page.getByRole('button', { name: 'A' });
		const second = page.getByRole('button', { name: 'B' });
		await first.hover();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-positioned', '');
		const firstLeft = page.getByTestId('positioner').element().getBoundingClientRect().left;
		second.element().dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await Promise.resolve();
		const duringSwitch = page.getByTestId('positioner').element();
		const stale =
			duringSwitch.hasAttribute('data-positioned') &&
			Math.abs(duringSwitch.getBoundingClientRect().left - firstLeft) < 2;
		expect(stale).toBe(false);
		await expect.poll(() => page.getByTestId('seen').element().textContent).toBe('trigger-b');
		await expect.poll(() => page.getByTestId('active').element().textContent).toBe('trigger-b');
		await expect
			.poll(() => {
				const popup = page.getByTestId('positioner').element().getBoundingClientRect().left;
				const next = second.element().getBoundingClientRect().left;
				return Math.abs(popup - next) < 30;
			})
			.toBe(true);
		switched.unmount();

		render(AnchoredPopupHarness, { scenario: 'refuse' });
		const kept = page.getByRole('button', { name: 'A' });
		await kept.click();
		await expect.element(page.getByTestId('positioner')).toHaveAttribute('data-positioned', '');
		const placed = page.getByTestId('positioner').element().getBoundingClientRect().left;
		await page.getByRole('button', { name: 'B' }).hover();
		await expect.poll(() => page.getByTestId('active').element().textContent).toBe('trigger-a');
		await expect
			.poll(() => {
				const left = page.getByTestId('positioner').element().getBoundingClientRect().left;
				return Math.abs(left - placed) < 2;
			})
			.toBe(true);
	});

	it('keeps a pending close timer when a hover delay changes', async () => {
		render(AnchoredPopupHarness, { scenario: 'delay' });
		await page.getByRole('button', { name: 'Open' }).hover();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		await page.getByTestId('outside').hover();
		await page.getByTestId('longer').click();
		await expect.poll(() => popup.elements().length, { timeout: 1500 }).toBe(0);
	});

	it('rounds a fractional anchor to device pixels', async () => {
		render(AnchoredPopupHarness, { scenario: 'pixels' });
		await page.getByRole('button', { name: 'Open' }).click();
		const positioner = page.getByTestId('positioner');
		await expect.element(positioner).toHaveAttribute('data-positioned', '');
		await expect.poll(() => positioner.element().style.left).toBe('10px');
		await expect.poll(() => positioner.element().style.top).toBe('36px');
	});

	it('keeps the popup in place, with available size, while it is closing', async () => {
		render(AnchoredPopupHarness, { scenario: 'closing' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const positioner = page.getByTestId('positioner');
		const popup = page.getByTestId('popup');
		await expect.element(positioner).toHaveAttribute('data-positioned', '');
		await expect
			.poll(() => positioner.element().style.getPropertyValue('--available-width'))
			.toMatch(/px$/);
		const placed = positioner.element().getBoundingClientRect().top;
		expect(placed).toBeGreaterThan(8);
		await trigger.click();
		await expect.element(popup).toHaveAttribute('data-ending-style', '');
		expect(Math.abs(positioner.element().getBoundingClientRect().top - placed)).toBeLessThan(2);
		expect(positioner.element().style.opacity).not.toBe('0');
		expect(positioner.element().style.getPropertyValue('--available-width')).toMatch(/px$/);
		await trigger.click();
		await expect.element(popup).toBeVisible();
		expect(positioner.element().style.getPropertyValue('--available-width')).toMatch(/px$/);
		expect(positioner.element().style.getPropertyValue('--available-height')).toMatch(/px$/);
	});
});

describe('safe polygon', () => {
	function dialogs() {
		return page.getByRole('dialog', { name: 'Notice' }).elements().length;
	}

	async function armClose() {
		const trigger = page.getByRole('button', { name: 'Open' }).element();
		const floating = page.getByTestId('positioner').element();
		const triggerRect = trigger.getBoundingClientRect();
		const floatingRect = floating.getBoundingClientRect();
		trigger.dispatchEvent(
			new MouseEvent('mouseleave', {
				bubbles: true,
				clientX: triggerRect.left + triggerRect.width / 2,
				clientY: triggerRect.bottom - 1,
				relatedTarget: document.body
			})
		);
		document.dispatchEvent(
			new MouseEvent('mousemove', {
				bubbles: true,
				clientX: triggerRect.right + 16,
				clientY: (triggerRect.bottom + floatingRect.top) / 2
			})
		);
	}

	it('cancels the pending close when the trigger unmounts', async () => {
		render(AnchoredPopupHarness, { scenario: 'unmount' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.hover();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await expect
			.poll(() => {
				const anchor = trigger.element().getBoundingClientRect();
				const popup = page.getByTestId('positioner').element().getBoundingClientRect();
				return popup.top - anchor.bottom > 20 && popup.width > anchor.width + 40;
			})
			.toBe(true);
		await armClose();
		expect(dialogs()).toBe(1);
		await expect.poll(dialogs, { timeout: 200 }).toBe(0);

		await page.getByTestId('outside').hover();
		await trigger.hover();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await armClose();
		const remove = page.getByTestId('remove').element();
		if (!(remove instanceof HTMLButtonElement)) throw new Error('missing remove button');
		remove.click();
		const started = performance.now();
		await expect
			.poll(
				() => {
					if (dialogs() !== 1) return 'closed';
					return performance.now() - started >= 90 ? 'held' : 'waiting';
				},
				{ timeout: 250 }
			)
			.toBe('held');
	});
});
