// Assertions follow Base UI v1.9.0
// packages/react/src/context-menu/trigger/ContextMenuTrigger.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (refs and React render-prop cloning).
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextMenuHarness from '../../tests/context-menu/ContextMenuHarness.svelte';
import ContextMenuOrphan from '../../tests/context-menu/ContextMenuOrphan.svelte';
import { contextMenu, touch, touchPoint } from '../../tests/context-menu/events.js';
import { mouse, pointer } from '../../tests/menu/mouse.js';
import { parkPointer } from '../../tests/pointer.js';
import type { ContextMenuRootChangeEventDetails } from './types.js';

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

function get(id: string) {
	const element = byTestId(id);
	if (!element) throw new Error(`no element with data-testid="${id}"`);
	return element;
}

function menu() {
	return document.querySelector('[role="menu"]');
}

/** A primary mouse press on the page, as upstream's `pointerDown` then `mouseDown`. */
function pressOutside() {
	pointer(document.body, 'pointerdown', { pointerType: 'mouse', button: 0 });
	mouse(document.body, 'mousedown', { button: 0 });
}

type Call = [boolean, ContextMenuRootChangeEventDetails];

function recorder() {
	const calls: Call[] = [];
	const onOpenChange = (open: boolean, details: ContextMenuRootChangeEventDetails) => {
		calls.push([open, details]);
	};
	return { calls, onOpenChange };
}

function fakeTimers() {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
}

async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

beforeEach(parkPointer);
afterEach(() => {
	vi.useRealTimers();
});

describe('ContextMenu.Trigger', () => {
	it('throws when rendered outside ContextMenu.Root', () => {
		expect(() => render(ContextMenuOrphan)).toThrow(
			'Base UI: ContextMenuRootContext is missing. ContextMenu parts must be placed within <ContextMenu.Root>.'
		);
	});

	// `-webkit-touch-callout` is WebKit-only. Chromium drops it from the style, as it does upstream.
	it('renders a div', () => {
		render(ContextMenuHarness);
		const trigger = get('trigger');
		expect(trigger.tagName).toBe('DIV');
		expect(trigger.textContent).toBe('Right click me');
	});

	it('opens the menu on right click', async () => {
		render(ContextMenuHarness);
		contextMenu(get('trigger'));
		await expect.poll(menu).not.toBeNull();
	});

	it('adds open state attributes', async () => {
		render(ContextMenuHarness, { open: true });
		const trigger = get('trigger');
		expect(trigger.getAttribute('data-popup-open')).toBe('');
		expect(trigger.getAttribute('data-pressed')).toBe('');

		await expect.poll(() => document.activeElement).toBe(get('popup'));
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => trigger.hasAttribute('data-popup-open')).toBe(false);
		expect(trigger.hasAttribute('data-pressed')).toBe(false);
	});

	it('calls onOpenChange when the menu is opened by right click', async () => {
		const { calls, onOpenChange } = recorder();
		render(ContextMenuHarness, { rootProps: { onOpenChange } });
		contextMenu(get('trigger'));
		await tick();
		expect(calls.map(([open, details]) => [open, details.reason])).toEqual([
			[true, 'trigger-press']
		]);
	});

	it('does not cancel opening the menu on a mouseup before 500ms', async () => {
		const { calls, onOpenChange } = recorder();
		render(ContextMenuHarness, { rootProps: { onOpenChange } });
		fakeTimers();
		const trigger = get('trigger');
		mouse(trigger, 'mousedown');
		contextMenu(trigger);
		await advance(499);
		expect(calls.map(([open]) => open)).toEqual([true]);

		mouse(document.body, 'mouseup');
		await advance(1);
		expect(calls.map(([open]) => open)).toEqual([true]);
		expect(menu()).not.toBeNull();
	});

	it('cancels opening the menu on a mouseup outside after 500ms', async () => {
		const { calls, onOpenChange } = recorder();
		render(ContextMenuHarness, { rootProps: { onOpenChange } });
		fakeTimers();
		const trigger = get('trigger');
		mouse(trigger, 'mousedown');
		contextMenu(trigger);
		await advance(501);

		mouse(document.body, 'mouseup');
		await tick();
		expect(calls.map(([open, details]) => [open, details.reason])).toEqual([
			[true, 'trigger-press'],
			[false, 'cancel-open']
		]);
	});

	it('keeps the menu open when the context-menu gesture ends inside its positioner', async () => {
		const { calls, onOpenChange } = recorder();
		render(ContextMenuHarness, { rootProps: { onOpenChange } });
		fakeTimers();
		contextMenu(get('trigger'));
		await advance(501);
		mouse(get('positioner'), 'mouseup');
		await tick();

		expect(calls).toHaveLength(1);
		expect(menu()).not.toBeNull();
	});

	it('keeps the root menu open when the context-menu gesture ends in a portaled submenu', async () => {
		const { calls, onOpenChange } = recorder();
		render(ContextMenuHarness, {
			scenario: 'open-submenu',
			rootProps: { onOpenChange },
			submenuProps: { open: true }
		});
		fakeTimers();
		contextMenu(get('trigger'));
		await advance(501);
		expect(byTestId('submenu-popup')).not.toBeNull();
		mouse(get('submenu-popup'), 'mouseup');
		await tick();

		expect(calls).toHaveLength(1);
		expect(byTestId('submenu-popup')).not.toBeNull();
	});

	it('aborts the pending document mouseup listener when the trigger unmounts', async () => {
		const { calls, onOpenChange } = recorder();
		let showTrigger = $state(true);
		render(ContextMenuHarness, {
			rootProps: { onOpenChange },
			get showTrigger() {
				return showTrigger;
			}
		});
		fakeTimers();
		contextMenu(get('trigger'));
		await tick();
		showTrigger = false;
		await tick();
		expect(byTestId('trigger')).toBeNull();

		await advance(501);
		mouse(document.body, 'mouseup');
		await tick();

		expect(calls).toHaveLength(1);
		expect(menu()).not.toBeNull();
	});

	describe('prop: disabled', () => {
		it('does not open on right click when disabled', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, { rootProps: { disabled: true, onOpenChange } });
			contextMenu(get('trigger'));
			await tick();
			expect(byTestId('popup')).toBeNull();
			expect(calls).toEqual([]);
		});

		it('ignores a right press outside the open menu once disabled', async () => {
			const { calls, onOpenChange } = recorder();
			let disabled = $state(false);
			render(ContextMenuHarness, {
				open: true,
				rootProps: {
					onOpenChange,
					get disabled() {
						return disabled;
					}
				}
			});
			await expect.poll(menu).not.toBeNull();
			disabled = true;
			await tick();

			pointer(document.body, 'pointerdown', { pointerType: 'mouse', button: 2 });
			await tick();
			expect(calls).toEqual([]);
			expect(menu()).not.toBeNull();
		});

		it('does not block the native context menu when disabled', async () => {
			render(ContextMenuHarness, { rootProps: { disabled: true } });
			const event = contextMenu(get('trigger'));
			await tick();
			expect(event.defaultPrevented).toBe(false);
		});
	});

	it('blocks native context menus on both internal and external backdrops', async () => {
		render(ContextMenuHarness, { open: true, backdrop: true });
		await expect.poll(menu).not.toBeNull();
		const internalBackdrop = document.querySelector(
			'[data-base-ui-portal] > [data-base-ui-inert][role="presentation"]'
		)!;
		expect(internalBackdrop).not.toBeNull();

		const internalEvent = contextMenu(internalBackdrop);
		const externalEvent = contextMenu(get('backdrop'));
		const outsideEvent = contextMenu(document.body);

		expect(internalEvent.defaultPrevented).toBe(true);
		expect(externalEvent.defaultPrevented).toBe(true);
		expect(outsideEvent.defaultPrevented).toBe(false);
	});

	it('blocks the native context menu when the rendered element replaces the trigger handler', async () => {
		const { calls, onOpenChange } = recorder();
		render(ContextMenuHarness, { scenario: 'replaced-handler', rootProps: { onOpenChange } });
		const event = contextMenu(get('trigger'));
		await tick();
		expect(event.defaultPrevented).toBe(true);
		expect(calls).toEqual([]);
		expect(menu()).toBeNull();
	});

	it('blocks native context menus in a portal mounted inside the trigger DOM subtree', async () => {
		render(ContextMenuHarness, { scenario: 'replaced-handler', open: true });
		await expect.poll(() => byTestId('popup')).not.toBeNull();
		expect(get('trigger').contains(get('popup'))).toBe(true);

		const event = contextMenu(get('popup'));
		expect(event.defaultPrevented).toBe(true);
	});

	describe('long press', () => {
		it('opens the menu on a long press on touchscreen devices', async () => {
			render(ContextMenuHarness);
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			await advance(500);
			expect(menu()).not.toBeNull();
		});

		it('cancels the long press when the touch moves beyond the threshold', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, { rootProps: { onOpenChange } });
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			touch(trigger, 'touchmove', [touchPoint(trigger, 120, 100)]);
			await advance(500);
			expect(menu()).toBeNull();
			expect(calls).toEqual([]);
		});

		it('keeps a pending long press when touch movement stays within the threshold', async () => {
			render(ContextMenuHarness);
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			touch(trigger, 'touchmove', [touchPoint(trigger, 105, 105)]);
			await advance(500);
			expect(menu()).not.toBeNull();
		});

		it('cancels a pending long press when the touch ends', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, { rootProps: { onOpenChange } });
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			touch(trigger, 'touchend');
			await advance(500);
			expect(calls).toEqual([]);
			expect(menu()).toBeNull();
		});

		it('cancels a pending long press when the gesture becomes multi-touch', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, { rootProps: { onOpenChange } });
			fakeTimers();
			const trigger = get('trigger');
			const first = touchPoint(trigger, 100, 100);
			const both = [first, touchPoint(trigger, 120, 100, 1)];

			touch(trigger, 'touchstart', [first]);
			touch(trigger, 'touchmove', both);
			touch(trigger, 'touchmove', [first]);
			await advance(500);
			expect(calls).toEqual([]);
			expect(menu()).toBeNull();

			touch(trigger, 'touchend');
			touch(trigger, 'touchstart', [first]);
			touch(trigger, 'touchstart', both);
			await advance(500);
			expect(calls).toEqual([]);
			expect(menu()).toBeNull();
		});

		it('delays outside-press dismissal after opening from a long press', async () => {
			render(ContextMenuHarness);
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			await advance(500);
			expect(menu()).not.toBeNull();

			pressOutside();
			await tick();
			expect(menu()).not.toBeNull();

			await advance(500);
			pressOutside();
			await advance(20);
			vi.useRealTimers();
			await expect.poll(menu).toBeNull();
		});

		it('positions a long-press menu against a 10px square around the finger', async () => {
			render(ContextMenuHarness, { positionerProps: { sideOffset: 0, alignOffset: 0 } });
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			await advance(500);
			vi.useRealTimers();
			await expect
				.poll(() => {
					const rect = get('positioner').getBoundingClientRect();
					return [rect.left, rect.top];
				})
				.toEqual([100, 110]);
		});

		it('does not open on a long press when disabled', async () => {
			const { calls, onOpenChange } = recorder();
			render(ContextMenuHarness, { rootProps: { disabled: true, onOpenChange } });
			fakeTimers();
			const trigger = get('trigger');
			touch(trigger, 'touchstart', [touchPoint(trigger, 100, 100)]);
			await advance(500);
			expect(byTestId('popup')).toBeNull();
			expect(calls).toEqual([]);
		});
	});

	it('handles nested context menus', async () => {
		render(ContextMenuHarness, { scenario: 'nested' });
		contextMenu(get('inner-trigger'));
		await expect.poll(() => byTestId('inner-menu')).not.toBeNull();
		expect(byTestId('outer-menu')).toBeNull();

		pressOutside();
		await expect.poll(() => byTestId('inner-menu')).toBeNull();

		contextMenu(get('outer-trigger'));
		await expect.poll(() => byTestId('outer-menu')).not.toBeNull();
		expect(byTestId('inner-menu')).toBeNull();
	});
});
