// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The nested menu and popup sizing cases are in NavigationMenuNested.svelte.spec.ts.
// Not ported: `ref` and render-prop conformance (NavigationMenuParts.svelte.spec.ts covers the host).
// `defaultValue` is an initial `value`, and a controlled `value` is `bind:value` here.
// `actionsRef` is the root's `close` and `unmount` exports, which the harness re-exports.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuHarness from '../../tests/NavigationMenuHarness.svelte';
import {
	click,
	expanded,
	flush,
	hover,
	hoverOpen,
	mockAnimations,
	mockBoundingClientRect,
	pointer,
	resetHover,
	touchClick,
	withAnimations
} from '../../tests/navigationMenuEvents.js';
import {
	advance,
	byId,
	dispatch,
	enter,
	leave,
	resetBrowserPointer,
	settlePositioning
} from '../../tests/previewCardEvents.js';
import { PATIENT_CLICK_THRESHOLD } from './constants.js';
import type { NavigationMenuChangeEventDetails } from './types.js';

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(async () => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	resetHover();
	await resetBrowserPointer();
	await settlePositioning();
});

function mockPopupRootSize(name: 'offsetWidth' | 'offsetHeight', openSize: number) {
	const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)!;
	Object.defineProperty(HTMLElement.prototype, name, {
		configurable: true,
		get(this: HTMLElement) {
			if (this.getAttribute('data-testid') !== 'popup-root') return original.get!.call(this);
			return byId('popup-1')?.hasAttribute('data-open') ? openSize : 0;
		}
	});
	return () => Object.defineProperty(HTMLElement.prototype, name, original);
}

describe('NavigationMenu.Root', () => {
	it('does not apply aria-orientation to the top-level list or root element', () => {
		render(NavigationMenuHarness, { value: 'item-1', orientation: 'vertical' });

		expect(byId('root')!.hasAttribute('aria-orientation')).toBe(false);
		expect(byId('list')!.hasAttribute('aria-orientation')).toBe(false);
	});

	describe('interactions', () => {
		it('opens on hover with mouse input', async () => {
			render(NavigationMenuHarness);

			await hoverOpen(byId('trigger-1')!);

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});

		it('blocks pointer events on the list while traversing from a top-level trigger to the popup', async () => {
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;
			const topLevelList = trigger.closest('ul') as HTMLElement;

			await hoverOpen(trigger);

			expect(byId('popup-1')).not.toBeNull();
			expect(topLevelList.style.pointerEvents).toBe('none');
			expect(document.body.style.pointerEvents).toBe('');
			expect(getComputedStyle(byId('trigger-2')!).pointerEvents).toBe('none');

			dispatch(byId('top-level-positioner')!, 'mouseenter');
			await flush();

			expect(topLevelList.style.pointerEvents).toBe('');
		});

		it('reapplies top-level safePolygon pointer events after returning from the popup and switching triggers', async () => {
			render(NavigationMenuHarness, { variant: 'topLevelLink' });
			const trigger1 = byId('trigger-1')!;
			const trigger2 = byId('trigger-2')!;
			const topLevelLink = byId('top-level-link')!;
			const topLevelList = trigger1.closest('ul') as HTMLElement;

			await hoverOpen(trigger1);
			const positioner = byId('top-level-positioner')!;

			expect(topLevelList.style.pointerEvents).toBe('none');
			expect(document.body.style.pointerEvents).toBe('');
			expect(getComputedStyle(topLevelLink).pointerEvents).toBe('none');

			dispatch(positioner, 'mouseenter');
			await flush();
			expect(topLevelList.style.pointerEvents).toBe('');

			leave(positioner, trigger1);
			enter(trigger1);
			await flush();

			expect(topLevelList.style.pointerEvents).toBe('none');
			expect(document.body.style.pointerEvents).toBe('');
			expect(getComputedStyle(topLevelLink).pointerEvents).toBe('none');

			dispatch(positioner, 'mouseenter');
			await flush();
			expect(topLevelList.style.pointerEvents).toBe('');

			leave(positioner, trigger2);
			enter(trigger2);
			await flush();

			expect(topLevelList.style.pointerEvents).toBe('none');
			expect(document.body.style.pointerEvents).toBe('');
			expect(getComputedStyle(topLevelLink).pointerEvents).toBe('none');
			expect(expanded('trigger-2')).toBe('true');
			expect(byId('popup-2')).not.toBeNull();
		});

		it('keeps top-level safePolygon pointer events active when switching directly to a different trigger', async () => {
			render(NavigationMenuHarness, { variant: 'topLevelLink' });
			const trigger1 = byId('trigger-1')!;
			const trigger2 = byId('trigger-2')!;
			const topLevelList = trigger1.closest('ul') as HTMLElement;

			await hoverOpen(trigger1);
			enter(trigger2);
			await flush();

			expect(topLevelList.style.pointerEvents).toBe('none');
			expect(document.body.style.pointerEvents).toBe('');
			expect(getComputedStyle(trigger1).pointerEvents).toBe('none');
			expect(getComputedStyle(byId('top-level-link')!).pointerEvents).toBe('none');
			expect(expanded('trigger-1')).toBe('false');
			expect(expanded('trigger-2')).toBe('true');
			expect(byId('popup-2')).not.toBeNull();
		});

		it('clears top-level safePolygon pointer events on trigger pointerdown', async () => {
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;
			const topLevelList = trigger.closest('ul') as HTMLElement;

			await hoverOpen(trigger);
			expect(topLevelList.style.pointerEvents).toBe('none');

			pointer(trigger, 'pointerdown', 'mouse');

			expect(topLevelList.style.pointerEvents).toBe('');
		});

		it('scopes safePolygon pointer events to the document for a custom list element', async () => {
			render(NavigationMenuHarness, { variant: 'customList' });
			const trigger = byId('trigger-1')!;

			await hoverOpen(trigger);

			expect(document.body.style.pointerEvents).toBe('none');
			expect(byId('custom-list')!.style.pointerEvents).toBe('');

			pointer(trigger, 'pointerdown', 'mouse');
			expect(document.body.style.pointerEvents).toBe('');

			const secondTrigger = byId('trigger-2')!;
			dispatch(secondTrigger, 'mouseenter');
			await flush();

			expect(secondTrigger.getAttribute('aria-expanded')).toBe('true');
			expect(document.body.style.pointerEvents).toBe('none');

			pointer(secondTrigger, 'pointerdown', 'mouse');
			expect(document.body.style.pointerEvents).toBe('');
		});

		it('blocks pointer events on sibling top-level triggers when opened through real hover', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;
			const topLevelList = trigger.closest('ul') as HTMLElement;

			await userEvent.hover(trigger);

			await expect.poll(() => topLevelList.style.pointerEvents).toBe('none');
			expect(getComputedStyle(byId('trigger-2')!).pointerEvents).toBe('none');
		});

		it('opens on click with mouse input', async () => {
			render(NavigationMenuHarness);

			click(byId('trigger-1')!);
			await flush();

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});

		it('does not open on hover with touch input', async () => {
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;

			pointer(trigger, 'pointerenter', 'touch');
			await hoverOpen(trigger);

			expect(byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});

		it.each([
			['horizontal', 'right', 'left'],
			['vertical', 'down', 'up']
		] as const)(
			'reports %s activation direction when switching in either direction',
			async (orientation, forwardDirection, backwardDirection) => {
				render(NavigationMenuHarness, { orientation });
				const trigger1 = byId('trigger-1')!;
				const trigger2 = byId('trigger-2')!;

				mockBoundingClientRect(trigger1, { x: 0, y: 0, width: 80, height: 32 });
				if (orientation === 'horizontal') {
					mockBoundingClientRect(trigger2, { x: 120, y: 0, width: 80, height: 32 });
				} else {
					mockBoundingClientRect(trigger2, { x: 0, y: 80, width: 80, height: 32 });
				}

				click(trigger1);
				await flush();
				click(trigger2);
				await flush();

				expect(byId('popup-2')!.getAttribute('data-activation-direction')).toBe(forwardDirection);

				click(trigger1);
				await flush();

				expect(byId('popup-1')!.getAttribute('data-activation-direction')).toBe(backwardDirection);
			}
		);

		it('opens on click with touch input', async () => {
			render(NavigationMenuHarness);

			touchClick(byId('trigger-1')!);
			await flush();

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});

		it('restores hover open after a touch click closes outside', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, { outside: true });
			const trigger1 = byId('trigger-1')!;

			pointer(trigger1, 'pointerenter', 'touch');
			touchClick(trigger1);
			await tick();
			expect(byId('popup-1')).not.toBeNull();

			await userEvent.click(byId('last')!);
			await expect.poll(() => byId('popup-1')).toBeNull();

			await userEvent.hover(byId('trigger-2')!);
			await expect.poll(() => byId('popup-2')).not.toBeNull();
		});

		it('restores hover open after a quick click then trigger switch', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness);
			const trigger1 = byId('trigger-1')!;
			const trigger2 = byId('trigger-2')!;

			hover(trigger1);
			await expect.poll(() => byId('popup-1')).not.toBeNull();

			click(trigger1);
			await tick();

			hover(trigger2);
			await expect.poll(() => byId('popup-2')).not.toBeNull();

			hover(document.body);
			await expect.poll(() => byId('popup-2')).toBeNull();

			hover(trigger1);
			await expect.poll(() => byId('popup-1')).not.toBeNull();
		});

		it('closes after pointerdown on a link in a hover-open popup when pointer leaves', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness);

			hover(byId('trigger-1')!);
			await expect.poll(() => byId('popup-1')).not.toBeNull();

			const link1 = byId('link-1')!;
			hover(link1);
			pointer(link1, 'pointerdown', 'mouse');
			hover(document.body);

			await expect.poll(() => byId('popup-1')).toBeNull();
		});

		it('does not close menu when clicking a different trigger with mouse', async () => {
			render(NavigationMenuHarness);

			click(byId('trigger-1')!);
			await flush();
			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');

			click(byId('trigger-2')!);
			await flush();

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-2')).not.toBeNull();
			expect(expanded('trigger-2')).toBe('true');
		});

		it('does not close menu when clicking a different trigger on touch', async () => {
			render(NavigationMenuHarness);

			click(byId('trigger-1')!);
			await flush();
			expect(byId('popup-1')).not.toBeNull();

			touchClick(byId('trigger-2')!);
			await flush();

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-2')).not.toBeNull();
			expect(expanded('trigger-2')).toBe('true');
		});

		it('returns focus to trigger when closing menu', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, { outside: true });
			const trigger = byId('trigger-1')!;

			await userEvent.click(trigger);
			await expect.poll(() => byId('popup-1')).not.toBeNull();

			const link = byId('link-1')!;
			link.focus();
			expect(document.activeElement).toBe(link);

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(document.activeElement).toBe(trigger);
		});

		it('respects focus outside when clicking menu', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, { outside: true });
			const trigger = byId('trigger-1')!;
			const last = byId('last')!;

			await userEvent.click(trigger);
			await expect.poll(() => byId('popup-1')).not.toBeNull();
			expect(document.activeElement).toBe(trigger);

			await userEvent.click(last);

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(document.activeElement).toBe(last);
		});

		it('does not restore focus to the trigger when closed via hover', async () => {
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;

			await hoverOpen(trigger);
			const popup = byId('popup-1')!;
			expect(expanded('trigger-1')).toBe('true');

			leave(trigger);
			leave(popup);
			await advance(50);
			await flush();

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
			expect(document.activeElement).not.toBe(trigger);
		});

		it('does not restore focus to the trigger when focus moves outside', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, { outside: true });
			const trigger = byId('trigger-1')!;
			const last = byId('last')!;

			trigger.focus();
			await userEvent.click(trigger);
			await userEvent.tab();
			await userEvent.tab();
			await userEvent.tab();
			await userEvent.tab();

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(document.activeElement).toBe(last);
		});
	});

	describe('patient click threshold', () => {
		it('stays open if hovered then clicked within the patient threshold', async () => {
			vi.useFakeTimers();
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;

			await hoverOpen(trigger);
			expect(expanded('trigger-1')).toBe('true');

			click(trigger);
			await flush();

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});

		it('closes if hovered then clicked after the patient threshold', async () => {
			render(NavigationMenuHarness);
			const trigger = byId('trigger-1')!;

			await hoverOpen(trigger);
			expect(expanded('trigger-1')).toBe('true');

			await advance(PATIENT_CLICK_THRESHOLD);
			click(trigger);
			await flush();

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});
	});

	describe('initial value', () => {
		it('should respect the initial value', async () => {
			render(NavigationMenuHarness, { value: 'item-1' });

			await hoverOpen(byId('trigger-1')!);

			expect(expanded('trigger-1')).toBe('true');
		});

		it('disables popup and arrow transitions while a kept portal opens', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, {
				variant: 'single',
				keepMountedPortal: true,
				withArrow: true
			});

			click(byId('trigger-1')!);
			await tick();

			expect(byId('popup-root')!.style.transition).toBe('none');
			expect(byId('arrow')!.style.transition).toBe('none');

			await expect.poll(() => byId('popup-root')!.style.transition).not.toBe('none');
			expect(byId('arrow')!.style.transition).not.toBe('none');
		});
	});

	describe('prop: onValueChange', () => {
		it('should call onValueChange when value changes', async () => {
			const onValueChange = vi.fn();
			render(NavigationMenuHarness, { onValueChange });

			click(byId('trigger-1')!);
			await flush();
			expect(onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.lastCall?.[0]).toBe('item-1');

			click(byId('trigger-2')!);
			await flush();
			expect(onValueChange.mock.calls.length).toBe(2);
			expect(onValueChange.mock.lastCall?.[0]).toBe('item-2');
		});

		it('does not open when onValueChange cancels the interaction', async () => {
			const onValueChange = vi.fn((_value: unknown, details: NavigationMenuChangeEventDetails) => {
				details.cancel();
			});
			render(NavigationMenuHarness, { onValueChange });

			click(byId('trigger-1')!);
			await flush();

			expect(onValueChange.mock.calls.length).toBe(1);
			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-1')).toBeNull();
		});

		it('does not emit a duplicate onValueChange when switching items via keyboard', async () => {
			vi.useRealTimers();
			const onValueChange = vi.fn();
			render(NavigationMenuHarness, { onValueChange });
			const trigger1 = byId('trigger-1')!;
			const trigger2 = byId('trigger-2')!;

			await userEvent.click(trigger1);
			expect(onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.lastCall?.[0]).toBe('item-1');

			trigger1.focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(trigger2);
			expect(onValueChange.mock.calls.filter((call) => call[0] === 'item-2').length).toBe(0);

			await userEvent.keyboard('{ArrowDown}');

			expect(onValueChange.mock.calls.filter((call) => call[0] === 'item-2').length).toBe(1);
			expect(expanded('trigger-2')).toBe('true');
		});

		it.each([
			['0', 0],
			['empty string', ''],
			['false', false]
		] as const)(
			'treats a falsy item value (%s) as a valid open value',
			async (_label, itemValue) => {
				const onValueChange = vi.fn();
				render(NavigationMenuHarness, { variant: 'single', item1Value: itemValue, onValueChange });

				click(byId('trigger-1')!);
				await flush();

				expect(onValueChange.mock.calls.length).toBe(1);
				expect(onValueChange.mock.lastCall?.[0]).toBe(itemValue);
				expect(expanded('trigger-1')).toBe('true');
				expect(byId('popup-1')).not.toBeNull();
			}
		);

		it('should be controlled by value prop', async () => {
			const screen = render(NavigationMenuHarness, { value: 'item-1' });

			await hoverOpen(byId('trigger-1')!);
			expect(expanded('trigger-1')).toBe('true');

			await screen.rerender({ value: 'item-2' });

			leave(byId('trigger-1')!);
			enter(byId('trigger-2')!);
			await flush();

			expect(expanded('trigger-1')).toBe('false');
			expect(expanded('trigger-2')).toBe('true');
		});

		it.each([false, true])(
			'preserves popup size when controlled value closes externally (keepMounted portal: %s)',
			async (keepMountedPortal) => {
				const restore = withAnimations();
				const restoreWidth = mockPopupRootSize('offsetWidth', 675);
				const restoreHeight = mockPopupRootSize('offsetHeight', 220);
				try {
					const screen = render(NavigationMenuHarness, { value: 'item-1', keepMountedPortal });
					await flush();
					const positioner = byId('top-level-positioner')!;
					const popupRoot = byId('popup-root')!;
					const animations = mockAnimations(popupRoot);

					animations.start();
					await screen.rerender({ value: null });
					await flush();

					expect(popupRoot.hasAttribute('data-ending-style')).toBe(true);
					expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('675px');
					expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('220px');
					expect(positioner.style.getPropertyValue('--positioner-width')).toBe('675px');
					expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px');

					await animations.finish();
					await flush();
				} finally {
					restore();
					restoreWidth();
					restoreHeight();
				}
			}
		);

		it('clears activation direction when controlled value closes externally after switching triggers', async () => {
			const restore = withAnimations();
			try {
				const screen = render(NavigationMenuHarness, { value: 'item-1' });
				await flush();
				const trigger1 = byId('trigger-1')!;
				const trigger2 = byId('trigger-2')!;
				mockBoundingClientRect(trigger1, { x: 0, y: 0, width: 80, height: 32 });
				mockBoundingClientRect(trigger2, { x: 120, y: 0, width: 80, height: 32 });

				click(trigger2);
				await screen.rerender({ value: 'item-2' });
				await flush();

				expect(byId('popup-2')!.getAttribute('data-activation-direction')).toBe('right');

				const exitingContent = byId('popup-2')!;
				const animations = mockAnimations(exitingContent);

				animations.start();
				await screen.rerender({ value: null });
				await flush();

				expect(exitingContent.hasAttribute('data-ending-style')).toBe(true);
				expect(exitingContent.hasAttribute('data-activation-direction')).toBe(false);

				await animations.finish();
				await flush();
			} finally {
				restore();
			}
		});
	});

	describe('prop: delay', () => {
		it('respects custom delay value', async () => {
			vi.useFakeTimers();
			const customDelay = 100;
			render(NavigationMenuHarness, { delay: customDelay });

			await hoverOpen(byId('trigger-1')!, customDelay - 25);
			expect(byId('popup-1')).toBeNull();

			await advance(50);
			await flush();

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});
	});

	describe('prop: closeDelay', () => {
		it('respects custom closeDelay value', async () => {
			// A clock that advances with real time could pass the delay between the two checks.
			vi.useFakeTimers();
			const customCloseDelay = 100;
			render(NavigationMenuHarness, { closeDelay: customCloseDelay });
			const trigger = byId('trigger-1')!;

			await hoverOpen(trigger);
			expect(byId('popup-1')).not.toBeNull();

			leave(trigger);
			await advance(customCloseDelay - 25);
			await flush();
			expect(byId('popup-1')).not.toBeNull();

			await advance(50);
			await flush();

			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});
	});

	describe('prop: disabled', () => {
		it('does not open on hover when the trigger is disabled', async () => {
			const onValueChange = vi.fn();
			render(NavigationMenuHarness, { variant: 'disabled', onValueChange });

			await hoverOpen(byId('trigger-1')!);

			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-1')).toBeNull();
			expect(onValueChange.mock.calls.length).toBe(0);
		});

		it('does not open on click when the trigger is disabled', async () => {
			const onValueChange = vi.fn();
			render(NavigationMenuHarness, { variant: 'disabled', onValueChange });

			click(byId('trigger-1')!);
			await flush();

			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-1')).toBeNull();
			expect(onValueChange.mock.calls.length).toBe(0);
		});

		it('does not open on touch when the trigger is disabled', async () => {
			const onValueChange = vi.fn();
			render(NavigationMenuHarness, { variant: 'disabled', onValueChange });

			touchClick(byId('trigger-1')!);
			await flush();

			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-1')).toBeNull();
			expect(onValueChange.mock.calls.length).toBe(0);
		});

		it('does not open via keyboard when the trigger is disabled', async () => {
			vi.useRealTimers();
			const onValueChange = vi.fn();
			render(NavigationMenuHarness, { variant: 'disabled', onValueChange });

			byId('trigger-1')!.focus();
			await userEvent.keyboard('{ArrowDown}');
			await tick();

			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-1')).toBeNull();
			expect(onValueChange.mock.calls.length).toBe(0);
		});
	});

	describe('close and unmount exports', () => {
		function closedCompletions(spy: { mock: { calls: unknown[][] } }) {
			return spy.mock.calls.filter(([open]) => !open).length;
		}

		function preventUnmount(value: unknown, details: NavigationMenuChangeEventDetails) {
			if (value == null) details.preventUnmountOnClose();
		}

		it('automatically unmounts and completes closing once', async () => {
			vi.useRealTimers();
			const onOpenChangeComplete = vi.fn();
			const screen = render(NavigationMenuHarness, { value: 'item-1', onOpenChangeComplete });
			expect(byId('popup-root')).not.toBeNull();

			await screen.rerender({ value: null });
			await expect.poll(() => byId('popup-root')).toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(1);

			screen.component.unmount();
			await tick();
			expect(closedCompletions(onOpenChangeComplete)).toBe(1);
		});

		it('keeps the popup mounted until the unmount export completes closing', async () => {
			const onOpenChangeComplete = vi.fn();
			const screen = render(NavigationMenuHarness, {
				value: 'item-1',
				onOpenChangeComplete,
				onValueChange: preventUnmount
			});
			expect(byId('popup-root')).not.toBeNull();

			screen.component.close();
			await flush();
			expect(byId('popup-root')).not.toBeNull();

			await screen.rerender({ value: null });
			await flush();
			expect(byId('popup-root')).not.toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(0);

			screen.component.unmount();
			await flush();

			expect(byId('popup-root')).toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(1);
		});

		it('closes through the `close` export so `onValueChange` can opt out', async () => {
			const onValueChange = vi.fn();
			const screen = render(NavigationMenuHarness, { value: 'item-1', onValueChange });
			expect(expanded('trigger-1')).toBe('true');

			screen.component.close();
			await flush();

			expect(onValueChange.mock.calls.length).toBe(1);
			expect(onValueChange.mock.calls[0][0]).toBe(null);
			expect(onValueChange.mock.calls[0][1].reason).toBe('imperative-action');
			expect(expanded('trigger-1')).toBe('false');
		});

		it('keeps the opt-out when the `close` export is called again while closed', async () => {
			const onOpenChangeComplete = vi.fn();
			const screen = render(NavigationMenuHarness, {
				value: 'item-1',
				onOpenChangeComplete,
				onValueChange: preventUnmount
			});

			screen.component.close();
			await flush();
			screen.component.close();
			await flush();

			expect(byId('popup-root')).not.toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(0);

			screen.component.unmount();
			await flush();
			expect(byId('popup-root')).toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(1);
		});

		it('keeps the opt-out when focus leaves the trigger during a manual exit', async () => {
			vi.useRealTimers();
			const onOpenChangeComplete = vi.fn();
			const screen = render(NavigationMenuHarness, {
				value: 'item-1',
				outside: true,
				onOpenChangeComplete,
				onValueChange: preventUnmount
			});

			const trigger = byId('trigger-1')!;
			trigger.focus();
			screen.component.close();
			await tick();
			trigger.focus();
			expect(expanded('trigger-1')).toBe('false');
			expect(byId('popup-root')).not.toBeNull();

			await userEvent.click(byId('last')!);
			await tick();

			expect(byId('popup-root')).not.toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(0);

			screen.component.unmount();
			await tick();
			expect(byId('popup-root')).toBeNull();
			expect(closedCompletions(onOpenChangeComplete)).toBe(1);
		});

		it('ignores `unmount` while the popup is open', async () => {
			const onOpenChangeComplete = vi.fn();
			const screen = render(NavigationMenuHarness, { value: 'item-1', onOpenChangeComplete });
			const popup = byId('popup-root');

			screen.component.unmount();
			await flush();

			expect(byId('popup-root')).toBe(popup);
			expect(closedCompletions(onOpenChangeComplete)).toBe(0);
			expect(expanded('trigger-1')).toBe('true');
		});

		it('still unmounts on a later close after `unmount` was called while open', async () => {
			vi.useRealTimers();
			const onOpenChangeComplete = vi.fn();
			const screen = render(NavigationMenuHarness, { value: 'item-1', onOpenChangeComplete });

			screen.component.unmount();
			await tick();
			expect(byId('popup-root')).not.toBeNull();

			await screen.rerender({ value: null });
			await expect.poll(() => byId('popup-root')).toBeNull();
			expect(onOpenChangeComplete.mock.lastCall).toEqual([false]);
		});

		it('unmounts immediately when called while the popup is closing', async () => {
			const restore = withAnimations();
			try {
				const screen = render(NavigationMenuHarness, {
					value: 'item-1',
					onValueChange: preventUnmount
				});
				await flush();
				const popupRoot = byId('popup-root')!;
				const animations = mockAnimations(popupRoot);
				const closingAnimation = animations.start();

				await screen.rerender({ value: null });
				await flush();
				expect(popupRoot.hasAttribute('data-ending-style')).toBe(true);

				screen.component.unmount();
				await flush();

				expect(byId('popup-root')).toBeNull();

				await animations.finish(closingAnimation);
				await flush();
			} finally {
				restore();
			}
		});
	});

	describe('prop: side', () => {
		it.each([
			['left in LTR', 'ltr', 'left'],
			['inline-start in LTR', 'ltr', 'inline-start'],
			['inline-end in RTL', 'rtl', 'inline-end']
		] as const)(
			'pins the popup to the right edge when side is %s so it grows leftward',
			async (_label, direction, side) => {
				render(NavigationMenuHarness, { variant: 'single', direction, side });

				click(byId('trigger-1')!);
				await flush();

				const popup = byId('popup-root')!;
				expect(popup.getAttribute('data-side')).toBe(side);
				const style = getComputedStyle(popup);
				expect([style.position, style.top, style.right]).toEqual(['absolute', '0px', '0px']);
			}
		);
	});

	describe('tabbing', () => {
		beforeEach(() => {
			vi.useRealTimers();
		});

		it('moves focus through the menu correctly', async () => {
			render(NavigationMenuHarness, { outside: true });
			const trigger1 = byId('trigger-1')!;

			trigger1.focus();
			click(trigger1);
			await tick();

			expect(byId('popup-1')).not.toBeNull();
			expect(document.activeElement).toBe(trigger1);

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-1'));

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-2'));

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('trigger-2'));

			click(byId('trigger-2')!);
			await tick();
			expect(byId('popup-2')).not.toBeNull();

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-3'));

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-4'));

			await userEvent.tab({ shift: true });
			await userEvent.tab({ shift: true });
			await userEvent.tab({ shift: true });

			expect(document.activeElement).toBe(trigger1);
		});

		it('closes the menu when tabbing forward out', async () => {
			render(NavigationMenuHarness, { outside: true });
			const trigger = byId('trigger-1')!;

			trigger.focus();
			click(trigger);
			await tick();
			expect(byId('popup-1')).not.toBeNull();
			expect(document.activeElement).toBe(trigger);

			await userEvent.tab();
			await userEvent.tab();
			await userEvent.tab();
			await userEvent.tab();

			await expect.poll(() => byId('popup-1')).toBeNull();
		});

		it('closes after tabbing out of arbitrary tabbable content', async () => {
			render(NavigationMenuHarness, { variant: 'action', outside: true });
			const trigger = byId('trigger-1')!;

			trigger.focus();
			click(trigger);
			await tick();

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('action'));

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('last'));
			await expect.poll(() => byId('popup-root')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});

		it('returns focus to the trigger when no viewport focus guard is rendered', async () => {
			render(NavigationMenuHarness, { variant: 'noViewport' });
			const trigger = byId('trigger-1')!;

			trigger.focus();
			click(trigger);
			await tick();

			const guards = trigger.parentElement!.querySelectorAll<HTMLElement>(
				'[data-base-ui-focus-guard]'
			);
			guards[1].focus();
			await tick();

			expect(document.activeElement).toBe(trigger);
			expect(expanded('trigger-1')).toBe('true');
		});

		it('returns to the last submenu item when shift+tabbing after tabbing out of it', async () => {
			render(NavigationMenuHarness, { outside: true });
			const trigger = byId('trigger-1')!;

			trigger.focus();
			click(trigger);
			await tick();
			expect(document.activeElement).toBe(trigger);

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-1'));

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-2'));

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('trigger-2'));

			await userEvent.tab({ shift: true });
			expect(document.activeElement).toBe(byId('link-2'));
		});

		it('closes the menu when tabbing back out', async () => {
			render(NavigationMenuHarness, { outside: true });
			const trigger = byId('trigger-1')!;

			trigger.focus();
			click(trigger);
			await tick();
			expect(document.activeElement).toBe(trigger);

			await userEvent.tab();
			expect(document.activeElement).toBe(byId('link-1'));

			await userEvent.tab({ shift: true });
			await userEvent.tab({ shift: true });

			await expect.poll(() => byId('popup-1')).toBeNull();
		});
	});

	describe('nested popups', () => {
		it('keeps a hover-open menu open when pointerdown happens on a nested dialog trigger', async () => {
			render(NavigationMenuHarness, { variant: 'dialog' });
			const trigger = byId('trigger-1')!;

			await hoverOpen(trigger);
			const popup = byId('popup-1')!;
			const dialogTrigger = byId('dialog-trigger')!;

			pointer(dialogTrigger, 'pointerdown', 'mouse');
			leave(popup);
			vi.useRealTimers();
			await userEvent.click(dialogTrigger);

			await expect.poll(() => byId('dialog-popup')).not.toBeNull();
			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});

		it('keeps the menu open when interacting with a nested dialog', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, { variant: 'dialog' });

			await userEvent.click(byId('trigger-1')!);
			await expect.poll(() => byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');

			await userEvent.click(byId('dialog-trigger')!);
			await expect.poll(() => byId('dialog-popup')).not.toBeNull();

			await userEvent.click(byId('dialog-button')!);

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});

		it('keeps the menu open when interacting with a nested popover', async () => {
			vi.useRealTimers();
			render(NavigationMenuHarness, { variant: 'popover' });

			await userEvent.click(byId('trigger-1')!);
			await expect.poll(() => byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');

			await userEvent.click(byId('popover-trigger')!);
			await expect.poll(() => byId('popover-popup')).not.toBeNull();

			await userEvent.click(byId('popover-button')!);

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
		});
	});
});

describe('initial open', () => {
	it('suppresses the positioner transition for the first frame while initially open', async () => {
		render(NavigationMenuHarness, { value: 'item-1' });

		const positioner = byId('top-level-positioner')!;
		expect(positioner.hasAttribute('data-instant')).toBe(true);

		await advance(0);
		await tick();
		expect(positioner.hasAttribute('data-instant')).toBe(false);
	});
});
