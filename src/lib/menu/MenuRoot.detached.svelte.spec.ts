// Assertions follow Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.detached-triggers.test.tsx
// and packages/react/test/detachedTriggersConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `defaultOpen` / `defaultTriggerId` (a root takes an initial `open` and `triggerId`
// instead) and the JSDOM-only branches.
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuDetachedHarness from '../../tests/menu/MenuDetachedHarness.svelte';
import MenuOverlapHarness from '../../tests/menu/MenuOverlapHarness.svelte';
import MenuTwoTriggerHarness from '../../tests/menu/MenuTwoTriggerHarness.svelte';
import { clickElement, enterWithMouse, leaveToBody, moveMouse } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';
import { Menu } from './index.js';
import type { MenuPopupState } from './types.js';

type Mode = 'contained' | 'detached';

function byTestId(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function trigger(number: number) {
	const element = byTestId(`trigger-${number}`);
	if (!element) throw new Error(`trigger ${number} is not rendered`);
	return element;
}

function popup() {
	return byTestId('popup');
}

function contentText() {
	return byTestId('content')?.textContent ?? null;
}

function focused() {
	return document.activeElement;
}

function leftOffset(element: Element, reference: Element) {
	return Math.abs(element.getBoundingClientRect().left - reference.getBoundingClientRect().left);
}

function expectActiveTrigger(activeNumber: number | null, count = 2) {
	const popupId = activeNumber === null ? null : popup()!.id;
	for (let number = 1; number <= count; number += 1) {
		const element = trigger(number);
		const active = number === activeNumber;
		expect(element.hasAttribute('data-popup-open')).toBe(active);
		expect(element.getAttribute('aria-expanded')).toBe(String(active));
		if (active) {
			expect(popupId).not.toBe('');
			expect(element.getAttribute('aria-controls')).toBe(popupId);
		} else if (popupId !== null) {
			expect(element.hasAttribute('aria-controls')).toBe(false);
		}
	}
}

function warnings(spy: { mock: { calls: unknown[][] } }, text: string) {
	return spy.mock.calls.filter(([message]) => typeof message === 'string' && message.includes(text))
		.length;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe.each<{ mode: Mode }>([{ mode: 'contained' }, { mode: 'detached' }])(
	'Menu detached triggers conformance with $mode triggers',
	({ mode }) => {
		const createHandle = () => (mode === 'detached' ? Menu.createHandle<number>() : undefined);

		it('opens with any trigger on click and marks only that trigger as active', async () => {
			render(MenuDetachedHarness, { mode, handle: createHandle(), triggerCount: 3 });
			expect(popup()).toBeNull();
			expectActiveTrigger(null, 3);

			for (const number of [1, 2, 3]) {
				await userEvent.click(trigger(number));
				await expect.poll(popup).not.toBeNull();
				expectActiveTrigger(number, 3);

				await userEvent.keyboard('{Escape}');
				await expect.poll(popup).toBeNull();
				expectActiveTrigger(null, 3);
			}
		});

		it('sets the payload of the active trigger and renders content based on it', async () => {
			render(MenuDetachedHarness, { mode, handle: createHandle() });

			await userEvent.click(trigger(1));
			await expect.poll(contentText).toBe('1');
			expect(byTestId('root-payload')?.textContent).toBe('1');

			clickElement(trigger(2));
			await expect.poll(contentText).toBe('2');
			expect(byTestId('root-payload')?.textContent).toBe('2');
			expectActiveTrigger(2);
		});

		it('reuses the popup DOM nodes when switching triggers', async () => {
			render(MenuDetachedHarness, { mode, handle: createHandle() });

			await userEvent.click(trigger(1));
			await expect.poll(contentText).toBe('1');
			const popupElement = popup();
			const positionerElement = byTestId('positioner');

			clickElement(trigger(2));
			await expect.poll(contentText).toBe('2');
			expect(popup()).toBe(popupElement);
			expect(byTestId('positioner')).toBe(positionerElement);
		});

		it('marks the trigger matching a controlled `triggerId` as active', async () => {
			render(MenuDetachedHarness, {
				mode,
				handle: createHandle(),
				open: true,
				triggerId: 'trigger-2'
			});

			await expect.poll(popup).not.toBeNull();
			expect(contentText()).toBe('2');
			expectActiveTrigger(2);
		});

		it('opens initially with the payload of a non-first `triggerId`', async () => {
			render(MenuDetachedHarness, {
				mode,
				handle: createHandle(),
				triggerCount: 3,
				open: true,
				triggerId: 'trigger-2'
			});

			await expect.poll(contentText).toBe('2');
			expectActiveTrigger(2, 3);
		});

		it('allows controlling the open state and active trigger programmatically', async () => {
			const props = {
				mode,
				handle: createHandle(),
				positionerProps: { side: 'bottom', align: 'start' }
			};
			const view = render(MenuDetachedHarness, props);

			await view.rerender({ ...props, open: true, triggerId: 'trigger-1' });
			await expect.poll(contentText).toBe('1');
			expectActiveTrigger(1);
			await expect
				.poll(() => leftOffset(byTestId('positioner')!, trigger(1)))
				.toBeLessThanOrEqual(1);

			await view.rerender({ ...props, open: true, triggerId: 'trigger-2' });
			await expect.poll(contentText).toBe('2');
			expectActiveTrigger(2);
			await expect
				.poll(() => leftOffset(byTestId('positioner')!, trigger(2)))
				.toBeLessThanOrEqual(1);

			await view.rerender({ ...props, open: false, triggerId: null });
			await expect.poll(popup).toBeNull();
			expectActiveTrigger(null);
		});

		it('does not leave an inline scale style on the popup after switching triggers', async () => {
			const onOpenChange = vi.fn();
			render(MenuDetachedHarness, {
				mode,
				handle: createHandle(),
				rootProps: { onOpenChange },
				withViewport: true
			});

			await userEvent.click(trigger(1));
			await expect.poll(contentText).toBe('1');
			clickElement(trigger(2));
			await expect.poll(contentText).toBe('2');

			expect(onOpenChange).toHaveBeenCalled();
			expect(onOpenChange.mock.calls.map(([open]) => open)).not.toContain(false);
			expect(popup()!.style.scale).toBe('');
		});
	}
);

describe('Menu detached triggers conformance, imperative actions on the handle', () => {
	it('opens by trigger id with its payload and closes', async () => {
		const handle = Menu.createHandle<number>();
		render(MenuDetachedHarness, { handle });
		expect(popup()).toBeNull();
		expect(handle.isOpen).toBe(false);

		handle.open('trigger-2');
		await expect.poll(contentText).toBe('2');
		expect(handle.isOpen).toBe(true);
		expectActiveTrigger(2);

		handle.close();
		await expect.poll(popup).toBeNull();
		expect(handle.isOpen).toBe(false);
		expectActiveTrigger(null);
	});

	it('throws when opened with an unregistered trigger id', () => {
		const handle = Menu.createHandle<number>();
		render(MenuDetachedHarness, { handle });

		expect(() => handle.open('missing')).toThrow(
			'was called with the trigger id "missing", but no matching trigger is registered'
		);
		expect(handle.isOpen).toBe(false);
	});
});

describe('Menu detached triggers conformance, root ownership', () => {
	it('ignores imperative calls while no root is attached and follows the root across remounts', async () => {
		const handle = Menu.createHandle<number>();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		handle.open('trigger-1');
		handle.close();
		expect(handle.isOpen).toBe(false);
		expect(warnings(warn, 'no root using this handle is mounted')).toBe(2);

		const view = render(MenuDetachedHarness, { handle, rootMounted: true });
		expect(popup()).toBeNull();
		expect(byTestId('root-payload')?.textContent).toBe('No payload');

		handle.open('trigger-1');
		await expect.poll(contentText).toBe('1');
		expect(handle.isOpen).toBe(true);

		await view.rerender({ handle, rootMounted: false });
		expect(handle.isOpen).toBe(false);
		expect(popup()).toBeNull();

		warn.mockClear();
		handle.open('trigger-1');
		handle.close();
		expect(handle.isOpen).toBe(false);
		expect(warnings(warn, 'no root using this handle is mounted')).toBe(2);

		await view.rerender({ handle, rootMounted: true });
		expect(popup()).toBeNull();
		expect(byTestId('root-payload')?.textContent).toBe('No payload');

		handle.open('trigger-2');
		await expect.poll(contentText).toBe('2');
		expect(handle.isOpen).toBe(true);
	});

	it('registers a detached trigger declared after the root', async () => {
		render(MenuDetachedHarness, { handle: Menu.createHandle<number>(), rootFirst: true });

		await userEvent.click(trigger(2));
		await expect.poll(contentText).toBe('2');
		expectActiveTrigger(2);
	});

	it('resolves a trigger still registered to the previous root during a transient overlap', async () => {
		const handle = Menu.createHandle<number>();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const openErrors: unknown[] = [];
		const onOpenError = (error: unknown) => openErrors.push(error);

		const view = render(MenuOverlapHarness, { handle, phase: 'outgoing', onOpenError });
		await view.rerender({ handle, phase: 'overlap', onOpenError });

		expect(openErrors).toEqual([]);
		expect(warnings(warn, 'No trigger found')).toBe(0);
		expect(handle.isOpen).toBe(true);
		await expect.poll(() => trigger(2).hasAttribute('data-popup-open')).toBe(true);
		expect(trigger(1).hasAttribute('data-popup-open')).toBe(false);

		await view.rerender({ handle, phase: 'incoming', onOpenError });
		expect(handle.isOpen).toBe(true);
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(true);
		expect(trigger(1).hasAttribute('data-popup-open')).toBe(false);
	});
});

describe('Menu detached triggers conformance, reparenting', () => {
	async function expectOpensAndCloses() {
		await userEvent.click(trigger(1));
		await expect.poll(popup).not.toBeNull();
		expectActiveTrigger(1, 1);
		await userEvent.keyboard('{Escape}');
		await expect.poll(popup).toBeNull();
	}

	it.each([
		{ name: 'when wrappers are removed', nestings: [3, 2, 1, 0], recreateHandle: false },
		{ name: 'when wrappers are added', nestings: [0, 1, 2, 3], recreateHandle: false },
		{
			name: 'during Fast Refresh-like handle recreation',
			nestings: [1, 1, 1],
			recreateHandle: true
		},
		{
			name: 'when reparented during Fast Refresh-like handle recreation',
			nestings: [3, 2, 1, 0],
			recreateHandle: true
		}
	])('keeps a detached trigger working $name', async ({ nestings, recreateHandle }) => {
		const [initialNesting, ...nextNestings] = nestings;
		const props = { triggerCount: 1, handle: Menu.createHandle<number>() };
		const view = render(MenuDetachedHarness, { ...props, nesting: initialNesting });
		await expectOpensAndCloses();

		for (const nesting of nextNestings) {
			const handle = recreateHandle ? Menu.createHandle<number>() : props.handle;
			await view.rerender({ ...props, handle, nesting });
			await expectOpensAndCloses();
		}
	});
});

describe('Menu multiple detached triggers opened on hover', () => {
	const SWITCH_CSS = (switchMs: number) => `
		.positioner { transition: top ${switchMs}ms linear, left ${switchMs}ms linear, transform ${switchMs}ms linear; }
		.popup { opacity: 1; transition: opacity 250ms linear; }
		.popup[data-ending-style] { opacity: 0; }
		.positioner[data-instant], .popup[data-instant] { transition: none; }
	`;

	function hoverTrigger(number: number) {
		return {
			openOnHover: true,
			delay: 0,
			style: `position:absolute;top:20px;left:${number === 1 ? 20 : 220}px`
		};
	}

	/**
	 * Hands an open menu from trigger 1 to trigger 2, so its instant is `trigger-change`.
	 * `settleTriggerChange: false` returns while the positioner still animates to trigger 2.
	 */
	async function renderHoverDetachedTriggers({ settleTriggerChange = true } = {}) {
		const instantsWhileEnding: (string | undefined)[] = [];
		render(MenuDetachedHarness, {
			handle: Menu.createHandle<number>(),
			triggerProps: hoverTrigger,
			positionerProps: { class: 'positioner' },
			popupProps: { class: 'popup' },
			css: SWITCH_CSS(120),
			onPopupState(state: MenuPopupState) {
				if (state.transitionStatus === 'ending') instantsWhileEnding.push(state.instant);
			}
		});

		enterWithMouse(trigger(1));
		await expect.poll(contentText).toBe('1');
		// The positioner places itself a frame after the content renders. A switch before that
		// has no position to transition from.
		const positioner = byTestId('positioner')!;
		await expect.poll(() => positioner.style.position).toBe('absolute');
		await Promise.all(positioner.getAnimations().map((animation) => animation.finished));
		moveMouse(trigger(1), trigger(2));
		await expect.poll(contentText).toBe('2');

		if (settleTriggerChange) {
			await expect.poll(() => popup()?.getAttribute('data-instant')).toBe('trigger-change');
		}
		// The handoff renders `trigger-change` while it closes the previous trigger's popup. Only
		// the close that follows matters.
		instantsWhileEnding.length = 0;
		return { instantsWhileEnding, popup: popup()! };
	}

	it('does not apply the trigger-change instant to a hover close after switching triggers', async () => {
		const { popup: popupElement, instantsWhileEnding } = await renderHoverDetachedTriggers();

		leaveToBody(trigger(2));
		await expect.poll(() => popupElement.hasAttribute('data-ending-style')).toBe(true);
		expect(instantsWhileEnding).not.toContain('trigger-change');
	});

	it('does not restore the trigger-change instant when a controlled close commits late', async () => {
		const instantsWhileEnding: (string | undefined)[] = [];
		// Renders between the close request and its late commit. The restoration lands there.
		const instantsWhileClosePending: (string | undefined)[] = [];
		const openedTriggerIds: (string | undefined)[] = [];
		let closeRequested = false;
		let open = $state(false);
		let triggerId = $state<string | null>(null);

		render(MenuDetachedHarness, {
			mode: 'contained',
			triggerProps: hoverTrigger,
			positionerProps: { class: 'positioner' },
			popupProps: { class: 'popup' },
			css: SWITCH_CSS(200),
			get open() {
				return open;
			},
			get triggerId() {
				return triggerId;
			},
			rootProps: {
				onOpenChange(nextOpen: boolean, details: { trigger?: Element; cancel(): void }) {
					if (nextOpen) {
						openedTriggerIds.push(details.trigger?.id);
						triggerId = details.trigger?.id ?? null;
						open = true;
						return;
					}
					// Svelte's equivalent of a controlled close that commits later: cancel the
					// internal close, then set the prop.
					details.cancel();
					closeRequested = true;
					setTimeout(() => (open = false), 400);
				}
			},
			onPopupState(state: MenuPopupState) {
				if (state.transitionStatus === 'ending') instantsWhileEnding.push(state.instant);
				else if (closeRequested) instantsWhileClosePending.push(state.instant);
			}
		});

		enterWithMouse(trigger(1));
		await expect.poll(popup).not.toBeNull();
		// Let the first open settle so moving to trigger 2 is a real switch.
		await new Promise((resolve) => setTimeout(resolve, 100));

		moveMouse(trigger(1), trigger(2));
		leaveToBody(trigger(2));

		await expect.poll(() => instantsWhileEnding.length, { timeout: 2000 }).toBeGreaterThan(0);
		expect(openedTriggerIds).toEqual(['trigger-1', 'trigger-2']);
		expect(instantsWhileClosePending).toContain('trigger-change');
		expect(instantsWhileEnding).not.toContain('trigger-change');
	});

	it('does not restore the trigger-change instant after a hover close has started', async () => {
		const { popup: popupElement } = await renderHoverDetachedTriggers({
			settleTriggerChange: false
		});
		const positioner = byTestId('positioner')!;
		await expect.poll(() => positioner.getAnimations().length).toBeGreaterThan(0);
		const switchAnimations = positioner.getAnimations();

		leaveToBody(trigger(2));
		await expect.poll(() => popupElement.hasAttribute('data-ending-style')).toBe(true);
		await Promise.all(switchAnimations.map((animation) => animation.finished));

		// Still mid-exit: a stale restore must not have marked it instant.
		expect(popup()).toBe(popupElement);
		expect(popupElement.hasAttribute('data-ending-style')).toBe(true);
		expect(popupElement.hasAttribute('data-instant')).toBe(false);
	});
});

describe.each<{ mode: Mode }>([{ mode: 'contained' }, { mode: 'detached' }])(
	'Menu nested menus with $mode triggers',
	({ mode }) => {
		const triggerButton = (name: string) => page.getByRole('button', { name, exact: true });

		it('supports keyboard navigation regardless of which trigger opened the menu', async () => {
			render(MenuTwoTriggerHarness, { mode });

			await userEvent.click(triggerButton('Trigger 1'));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();
			// The menu focuses itself a frame after opening. Keys sent earlier go to the trigger.
			await expect.poll(() => focused()?.getAttribute('role')).toBe('menu');

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			const submenuTrigger = byTestId('submenu-trigger-1');
			await expect.poll(focused).toBe(submenuTrigger);

			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(focused).toBe(byTestId('submenu-item'));

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => byTestId('level-2')).toBeNull();
			expect(focused()).toBe(submenuTrigger);

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => byTestId('level-1')).toBeNull();

			await userEvent.click(triggerButton('Trigger 2'));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();
		});

		it('opens a submenu on click when hover is disabled', async () => {
			render(MenuTwoTriggerHarness, { mode, submenuOpenOnHover: false });

			await userEvent.click(triggerButton('Trigger 1'));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();
			expect(byTestId('level-2')).toBeNull();

			await userEvent.click(byTestId('submenu-trigger-1')!);
			await expect.poll(() => byTestId('submenu-item')?.textContent).toBe('Item 2');

			await userEvent.click(byTestId('submenu-item')!);
			await expect.poll(() => byTestId('level-1')).toBeNull();

			await userEvent.click(triggerButton('Trigger 2'));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();
			expect(byTestId('level-2')).toBeNull();
		});

		it('closes every level when clicking outside the deepest submenu', async () => {
			render(MenuTwoTriggerHarness, { mode, depth: 2 });

			await userEvent.click(triggerButton('Trigger 1'));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();
			await expect.poll(() => focused()?.getAttribute('role')).toBe('menu');

			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(focused).toBe(byTestId('submenu-trigger-1'));

			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(focused).toBe(byTestId('submenu-item'));

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(focused).toBe(byTestId('submenu-trigger-2'));

			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => byTestId('level-3')).not.toBeNull();

			await userEvent.click(byTestId('outside')!, { force: true });
			await expect.poll(() => byTestId('level-1')).toBeNull();
			expect(byTestId('level-2')).toBeNull();
			expect(byTestId('level-3')).toBeNull();
		});

		it('selects nested items with click, drag, release', async () => {
			const onNestedClick = vi.fn();
			render(MenuTwoTriggerHarness, { mode, onNestedClick });

			triggerButton('Trigger 1')
				.element()
				.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 1 }));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();

			await userEvent.hover(byTestId('submenu-trigger-1')!);
			await expect.poll(() => byTestId('level-2')).not.toBeNull();
			// Item mouseup activates 200ms after the opening press.
			await new Promise((resolve) => setTimeout(resolve, 200));

			byTestId('submenu-item')!.dispatchEvent(
				new MouseEvent('mouseup', { bubbles: true, cancelable: true, detail: 1 })
			);
			await expect.poll(() => byTestId('level-1')).toBeNull();
			expect(onNestedClick).toHaveBeenCalledTimes(1);

			await parkPointer();
			await userEvent.click(triggerButton('Trigger 2'));
			await expect.poll(() => byTestId('level-1')).not.toBeNull();
		});
	}
);
