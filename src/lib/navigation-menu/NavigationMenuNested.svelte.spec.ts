// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099), its nested menu and popup sizing cases.
// MIT, see THIRD_PARTY_NOTICES.md.
// `defaultValue` is an initial `value` here. Upstream's `within(popup)` lookups are plain test ids.
import { flushSync, tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuHarness from '../../tests/NavigationMenuHarness.svelte';
import NavigationMenuNestedHarness from '../../tests/NavigationMenuNestedHarness.svelte';
import NavigationMenuSizingHarness from '../../tests/NavigationMenuSizingHarness.svelte';
import {
	click,
	expanded,
	flush,
	hoverOpen,
	mockAnimations,
	mockBoundingClientRect,
	pointer,
	resetHover,
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

const falsyValues = [
	['0', 0],
	['empty string', ''],
	['false', false]
] as const;

function mockSize(element: HTMLElement, name: 'offsetWidth' | 'offsetHeight', read: () => number) {
	Object.defineProperty(element, name, { configurable: true, get: read });
}

/** Mocks a size on `popup-root` before it exists. */
function mockPrototypeSize(name: 'offsetWidth' | 'offsetHeight', read: () => number) {
	const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)!;
	Object.defineProperty(HTMLElement.prototype, name, {
		configurable: true,
		get(this: HTMLElement) {
			if (this.getAttribute('data-testid') !== 'popup-root') return original.get!.call(this);
			return read();
		}
	});
	return () => Object.defineProperty(HTMLElement.prototype, name, original);
}

function sizeVars(popupRoot: HTMLElement, positioner: HTMLElement) {
	return {
		popupWidth: popupRoot.style.getPropertyValue('--popup-width'),
		popupHeight: popupRoot.style.getPropertyValue('--popup-height'),
		positionerWidth: positioner.style.getPropertyValue('--positioner-width'),
		positionerHeight: positioner.style.getPropertyValue('--positioner-height')
	};
}

function primeSize(
	popupRoot: HTMLElement,
	positioner: HTMLElement,
	popup: [string, string],
	box: [number, number]
) {
	popupRoot.style.setProperty('--popup-width', popup[0]);
	popupRoot.style.setProperty('--popup-height', popup[1]);
	positioner.style.setProperty('--positioner-width', `${box[0]}px`);
	positioner.style.setProperty('--positioner-height', `${box[1]}px`);
}

function cssPx(element: HTMLElement, name: string) {
	return parseInt(getComputedStyle(element).getPropertyValue(name), 10);
}

/** Replaces `ResizeObserver` for one test. `undefined` removes it. */
function replaceResizeObserver(next: typeof ResizeObserver | undefined) {
	const original = globalThis.ResizeObserver;
	globalThis.ResizeObserver = next as typeof ResizeObserver;
	return () => {
		globalThis.ResizeObserver = original;
	};
}

const InertResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

function moveDocument(clientX: number, clientY: number) {
	document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX, clientY }));
}

function nextFrame() {
	return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe('NavigationMenu.Root nested', () => {
	it('does not apply aria-orientation to nested lists or root elements', () => {
		render(NavigationMenuNestedHarness, { variant: 'orientation' });

		expect(byId('top-level-root')!.hasAttribute('aria-orientation')).toBe(false);
		expect(byId('top-level-list')!.hasAttribute('aria-orientation')).toBe(false);
		expect(byId('nested-root')!.hasAttribute('aria-orientation')).toBe(false);
		expect(byId('nested-list')!.hasAttribute('aria-orientation')).toBe(false);
	});

	it('restores hover open after touching a nested submenu trigger and closing outside', async () => {
		vi.useRealTimers();
		render(NavigationMenuNestedHarness, { outside: true });
		const trigger = byId('trigger-1')!;

		pointer(trigger, 'pointerenter', 'touch');
		pointer(trigger, 'pointerdown', 'touch');
		pointer(trigger, 'pointerup', 'touch');
		click(trigger);
		await tick();

		const nestedTrigger2 = byId('nested-trigger-2')!;
		pointer(nestedTrigger2, 'pointerenter', 'touch');
		pointer(nestedTrigger2, 'pointerdown', 'touch');
		pointer(nestedTrigger2, 'pointerup', 'touch');
		click(nestedTrigger2);
		await tick();

		expect(byId('nested-popup-2')).not.toBeNull();

		await userEvent.click(byId('outside')!);
		await expect.poll(() => byId('popup-1')).toBeNull();

		await userEvent.hover(trigger);
		await expect.poll(() => byId('popup-1')).not.toBeNull();
	});

	describe('nested menus', () => {
		it('opens nested menu on hover and stays open when hovering over nested popup', async () => {
			render(NavigationMenuNestedHarness, { variant: 'portal' });

			await hoverOpen(byId('trigger-1')!);
			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');

			await hoverOpen(byId('nested-trigger-1')!);
			const nestedPopup1 = byId('nested-popup-1')!;
			expect(nestedPopup1).not.toBeNull();
			expect(expanded('nested-trigger-1')).toBe('true');

			enter(nestedPopup1);
			await flush();

			expect(byId('popup-1')).not.toBeNull();
			expect(byId('nested-popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
			expect(expanded('nested-trigger-1')).toBe('true');
		});

		it('makes an inline viewport inert when focus leaves it, until the value changes', async () => {
			render(NavigationMenuNestedHarness);
			click(byId('trigger-1')!);
			await flush();

			const viewport = byId('inline-nested-viewport')!;
			const nestedLink1 = byId('nested-popup-1')!.querySelector('a')!;
			const topLink1 = byId('popup-1')!.querySelector('a')!;
			const nestedTrigger1 = byId('nested-trigger-1')!;

			nestedLink1.focus();
			nestedTrigger1.focus();
			await flush();
			expect(viewport.hasAttribute('inert')).toBe(false);

			nestedLink1.focus();
			topLink1.focus();
			await flush();
			expect(viewport.hasAttribute('inert')).toBe(true);

			click(byId('nested-trigger-2')!);
			await flush();
			expect(expanded('nested-trigger-2')).toBe('true');
			expect(viewport.hasAttribute('inert')).toBe(false);
		});

		it('handles inline nested menu without positioner/popup correctly', async () => {
			render(NavigationMenuNestedHarness);

			await hoverOpen(byId('trigger-1')!);
			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');

			await hoverOpen(byId('nested-trigger-1')!);
			const nestedPopup1 = byId('nested-popup-1')!;
			expect(expanded('nested-trigger-1')).toBe('true');

			enter(nestedPopup1);
			await flush();

			expect(byId('popup-1')).not.toBeNull();
			expect(byId('nested-popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
			expect(expanded('nested-trigger-1')).toBe('true');

			await hoverOpen(byId('nested-trigger-2')!);

			expect(byId('nested-popup-2')).not.toBeNull();
			expect(expanded('nested-trigger-2')).toBe('true');
			expect(expanded('nested-trigger-1')).toBe('false');
		});

		it('keeps parent menu open when hovering inline nested triggers without an initial value', async () => {
			render(NavigationMenuNestedHarness, { nestedDefaultValue: null });

			await hoverOpen(byId('trigger-1')!);
			expect(expanded('nested-trigger-1')).toBe('false');

			await hoverOpen(byId('nested-trigger-1')!);

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
			expect(byId('nested-popup-1')).not.toBeNull();
			expect(expanded('nested-trigger-1')).toBe('true');

			await hoverOpen(byId('nested-trigger-2')!);

			expect(byId('popup-1')).not.toBeNull();
			expect(expanded('trigger-1')).toBe('true');
			expect(byId('nested-popup-2')).not.toBeNull();
			expect(expanded('nested-trigger-2')).toBe('true');
		});

		it('closes the parent menu after a nested submenu closes on delayed hover-out', async () => {
			const closeDelay = 200;
			render(NavigationMenuNestedHarness, { variant: 'portal', closeDelay });

			await hoverOpen(byId('trigger-1')!);
			const nestedTrigger1 = byId('nested-trigger-1')!;
			const topLevelPositioner = byId('top-level-positioner')!;

			await hoverOpen(nestedTrigger1);
			expect(byId('nested-popup-1')).not.toBeNull();
			const nestedPositioner = byId('nested-positioner')!;

			leave(nestedTrigger1);
			leave(nestedPositioner);
			leave(topLevelPositioner);
			await advance(closeDelay);
			await flush();

			await expect.poll(() => byId('nested-popup-1')).toBeNull();
			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});

		it('closes the parent menu when a nested link with closeOnClick is clicked', async () => {
			render(NavigationMenuNestedHarness, { variant: 'portalCloseOnClick' });

			click(byId('trigger-1')!);
			await flush();
			expect(byId('popup-1')).not.toBeNull();

			await hoverOpen(byId('nested-trigger-1')!);
			expect(byId('nested-popup-1')).not.toBeNull();

			click(byId('nested-link-1')!);

			await expect.poll(() => byId('nested-popup-1')).toBeNull();
			await expect.poll(() => byId('popup-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});

		it('calls onValueChange on the parent root when nested closeOnClick link is clicked', async () => {
			const onValueChange = vi.fn();
			render(NavigationMenuNestedHarness, { variant: 'portalCloseOnClick', onValueChange });

			click(byId('trigger-1')!);
			await flush();
			await hoverOpen(byId('nested-trigger-1')!);

			click(byId('nested-link-1')!);

			await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe(null);
		});

		it('closes all levels when a deeply nested link with closeOnClick is clicked', async () => {
			render(NavigationMenuNestedHarness, { variant: 'deepCloseOnClick' });

			click(byId('trigger-1')!);
			await flush();

			expect(byId('content-1')).not.toBeNull();
			expect(byId('level2-content-1')).not.toBeNull();
			expect(byId('level3-content-1')).not.toBeNull();

			click(byId('level3-link-1')!);

			await expect.poll(() => byId('level3-content-1')).toBeNull();
			await expect.poll(() => byId('level2-content-1')).toBeNull();
			await expect.poll(() => byId('content-1')).toBeNull();
			expect(expanded('trigger-1')).toBe('false');
		});

		describe('inline nested viewport', () => {
			it('renders viewport content correctly for inline nested menu', async () => {
				render(NavigationMenuNestedHarness);

				await hoverOpen(byId('trigger-1')!);

				expect(byId('popup-1')).not.toBeNull();
				expect(expanded('nested-trigger-1')).toBe('true');
				expect(byId('nested-popup-1')!.textContent).toContain('Nested Link 1');
			});

			it('switches content in viewport when hovering different nested triggers', async () => {
				render(NavigationMenuNestedHarness);

				await hoverOpen(byId('trigger-1')!);
				expect(expanded('nested-trigger-1')).toBe('true');
				expect(byId('nested-popup-1')).not.toBeNull();

				await hoverOpen(byId('nested-trigger-2')!);

				expect(expanded('nested-trigger-2')).toBe('true');
				expect(expanded('nested-trigger-1')).toBe('false');
				expect(byId('nested-popup-2')).not.toBeNull();
				await expect.poll(() => byId('nested-popup-1')).toBeNull();

				await hoverOpen(byId('nested-trigger-1')!);

				expect(expanded('nested-trigger-1')).toBe('true');
				expect(expanded('nested-trigger-2')).toBe('false');
				expect(byId('nested-popup-1')).not.toBeNull();
				await expect.poll(() => byId('nested-popup-2')).toBeNull();
			});

			it('scopes inline safePolygon pointer events to the submenu list while traversing to the viewport', async () => {
				render(NavigationMenuNestedHarness);

				await hoverOpen(byId('trigger-1')!);

				const nestedList = byId('inline-nested-list')!;
				const nestedTrigger1 = byId('nested-trigger-1')!;
				const nestedViewport = byId('inline-nested-viewport')!;
				mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 });
				mockBoundingClientRect(nestedViewport, { x: 200, y: 0, width: 300, height: 300 });
				dispatch(nestedTrigger1, 'mouseenter');

				expect(nestedList.style.pointerEvents).toBe('none');

				dispatch(nestedTrigger1, 'mouseleave', { clientX: 98, clientY: 60 });

				expect(nestedList.style.pointerEvents).toBe('none');
				expect(document.body.style.pointerEvents).toBe('');

				moveDocument(150, 80);
				await flush();

				expect(expanded('nested-trigger-1')).toBe('true');
				expect(byId('nested-popup-1')).not.toBeNull();
				expect(nestedList.style.pointerEvents).toBe('none');

				dispatch(nestedViewport, 'mouseenter');
				await flush();

				expect(nestedList.style.pointerEvents).toBe('');
			});

			it.each([
				[
					'right',
					{ x: 0, y: 0, width: 100, height: 100 },
					{ x: 120, y: 0, width: 100, height: 100 },
					{ clientX: 100, clientY: 50 },
					{ clientX: 110, clientY: 50 }
				],
				[
					'left',
					{ x: 0, y: 0, width: 100, height: 100 },
					{ x: -120, y: 0, width: 100, height: 100 },
					{ clientX: 0, clientY: 50 },
					{ clientX: -10, clientY: 50 }
				],
				[
					'bottom',
					{ x: 0, y: 0, width: 100, height: 100 },
					{ x: 0, y: 120, width: 100, height: 100 },
					{ clientX: 50, clientY: 100 },
					{ clientX: 50, clientY: 110 }
				],
				[
					'top',
					{ x: 0, y: 0, width: 100, height: 100 },
					{ x: 0, y: -120, width: 100, height: 100 },
					{ clientX: 50, clientY: 0 },
					{ clientX: 50, clientY: -10 }
				]
			] as const)(
				'keeps an inline submenu open while traversing toward a viewport on the %s',
				async (_placement, triggerRect, viewportRect, leavePoint, traversePoint) => {
					render(NavigationMenuNestedHarness, { nestedDefaultValue: null });
					await hoverOpen(byId('trigger-1')!);

					const nestedTrigger = byId('nested-trigger-1')!;
					const nestedViewport = byId('inline-nested-viewport')!;
					const nestedList = byId('inline-nested-list')!;
					mockBoundingClientRect(nestedTrigger, triggerRect);
					mockBoundingClientRect(nestedViewport, viewportRect);

					await hoverOpen(nestedTrigger);

					expect(expanded('nested-trigger-1')).toBe('true');
					expect(nestedList.style.pointerEvents).toBe('none');
					dispatch(nestedTrigger, 'mouseleave', leavePoint);
					moveDocument(traversePoint.clientX, traversePoint.clientY);
					expect(nestedList.style.pointerEvents).toBe('none');
					await advance(50);
					await flush();

					expect(expanded('nested-trigger-1')).toBe('true');
					expect(byId('nested-popup-1')).not.toBeNull();
				}
			);

			it('clears inline safePolygon pointer events when the pointer leaves the traversal path', async () => {
				render(NavigationMenuNestedHarness);
				await hoverOpen(byId('trigger-1')!);

				const nestedList = byId('inline-nested-list')!;
				const nestedTrigger1 = byId('nested-trigger-1')!;
				mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 });
				mockBoundingClientRect(byId('inline-nested-viewport')!, {
					x: 200,
					y: 0,
					width: 300,
					height: 300
				});
				dispatch(nestedTrigger1, 'mouseenter');

				expect(nestedList.style.pointerEvents).toBe('none');

				dispatch(nestedTrigger1, 'mouseleave', { clientX: 98, clientY: 60 });
				expect(nestedList.style.pointerEvents).toBe('none');

				moveDocument(40, 220);
				await flush();

				expect(nestedList.style.pointerEvents).toBe('');
				expect(expanded('nested-trigger-1')).toBe('true');
				expect(byId('nested-popup-1')).not.toBeNull();
			});

			it('keeps inline safePolygon pointer events when returning to the original trigger before traversing again', async () => {
				render(NavigationMenuNestedHarness);
				await hoverOpen(byId('trigger-1')!);

				const nestedList = byId('inline-nested-list')!;
				const nestedTrigger1 = byId('nested-trigger-1')!;
				const nestedTrigger2 = byId('nested-trigger-2')!;
				const nestedViewport = byId('inline-nested-viewport')!;
				mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 });
				mockBoundingClientRect(nestedTrigger2, { x: 0, y: 100, width: 100, height: 40 });
				mockBoundingClientRect(nestedViewport, { x: 200, y: 0, width: 300, height: 300 });

				dispatch(nestedTrigger1, 'mouseenter');
				dispatch(nestedTrigger1, 'mouseleave', { clientX: 98, clientY: 60 });
				moveDocument(150, 80);
				await flush();
				dispatch(nestedViewport, 'mouseenter');
				await flush();

				await hoverOpen(nestedTrigger2);
				await hoverOpen(nestedTrigger1);

				expect(nestedList.style.pointerEvents).toBe('none');

				dispatch(nestedTrigger1, 'mouseleave', { clientX: 98, clientY: 60 });
				moveDocument(150, 80);
				await flush();

				expect(nestedList.style.pointerEvents).toBe('none');
				expect(expanded('nested-trigger-1')).toBe('true');
				expect(expanded('nested-trigger-2')).toBe('false');
				expect(byId('nested-popup-1')).not.toBeNull();
				await expect.poll(() => byId('nested-popup-2')).toBeNull();
			});

			it('closes inline nested viewport when parent menu closes', async () => {
				render(NavigationMenuNestedHarness);
				const trigger1 = byId('trigger-1')!;

				await hoverOpen(trigger1);
				const popup1 = byId('popup-1')!;
				expect(expanded('nested-trigger-1')).toBe('true');
				expect(byId('nested-popup-1')).not.toBeNull();

				leave(trigger1);
				leave(popup1);
				await advance(50);
				await flush();

				await expect.poll(() => byId('popup-1')).toBeNull();
				expect(byId('nested-popup-1')).toBeNull();
				expect(expanded('trigger-1')).toBe('false');
			});

			it('maintains inline viewport state when hovering between triggers and content', async () => {
				render(NavigationMenuNestedHarness);
				await hoverOpen(byId('trigger-1')!);

				const nestedTrigger2 = byId('nested-trigger-2')!;
				await hoverOpen(nestedTrigger2);

				expect(expanded('nested-trigger-2')).toBe('true');
				const nestedPopup2 = byId('nested-popup-2')!;

				enter(nestedPopup2);
				await flush();

				expect(expanded('nested-trigger-2')).toBe('true');
				expect(byId('nested-popup-2')).not.toBeNull();

				enter(nestedTrigger2);
				await flush();

				expect(expanded('nested-trigger-2')).toBe('true');
				expect(byId('nested-popup-2')).not.toBeNull();
			});

			it('handles click interactions on inline nested menu triggers', async () => {
				render(NavigationMenuNestedHarness);

				click(byId('trigger-1')!);
				await flush();
				expect(byId('popup-1')).not.toBeNull();
				expect(expanded('nested-trigger-1')).toBe('true');

				const nestedTrigger2 = byId('nested-trigger-2')!;
				click(nestedTrigger2);
				await flush();

				expect(expanded('nested-trigger-2')).toBe('true');
				expect(expanded('nested-trigger-1')).toBe('false');
				expect(byId('nested-popup-2')).not.toBeNull();
				await expect.poll(() => byId('nested-popup-1')).toBeNull();

				click(nestedTrigger2);
				await flush();

				expect(expanded('nested-trigger-2')).toBe('true');
				expect(expanded('nested-trigger-1')).toBe('false');
				expect(byId('nested-popup-2')).not.toBeNull();
				expect(byId('nested-popup-1')).toBeNull();
			});

			it('adds popup-open data attributes to the active icon', () => {
				render(NavigationMenuHarness, { value: 'item-1', withIcon: true });

				expect(byId('icon-1')!.getAttribute('data-popup-open')).toBe('');
				expect(byId('icon-2')!.hasAttribute('data-popup-open')).toBe(false);
			});

			it.each(falsyValues)(
				'treats a falsy value (%s) as open for inline nested trigger interactions',
				async (_label, itemValue) => {
					render(NavigationMenuNestedHarness, {
						nestedDefaultValue: itemValue,
						nestedItem1Value: itemValue
					});

					click(byId('trigger-1')!);
					await flush();

					expect(expanded('nested-trigger-1')).toBe('true');
					expect(byId('nested-popup-1')).not.toBeNull();

					click(byId('nested-trigger-1')!);
					await flush();

					expect(expanded('nested-trigger-1')).toBe('true');
					expect(byId('nested-popup-1')).not.toBeNull();
				}
			);

			it('propagates a nested close with a falsy open value to the parent root', async () => {
				render(NavigationMenuNestedHarness, {
					nestedDefaultValue: false,
					nestedItem1Value: false,
					nestedLinkCloseOnClick: true
				});

				click(byId('trigger-1')!);
				await flush();
				expect(expanded('nested-trigger-1')).toBe('true');

				click(byId('nested-popup-1')!.querySelector('a')!);
				await flush();

				expect(expanded('trigger-1')).toBe('false');
				await expect.poll(() => byId('popup-1')).toBeNull();
			});

			it('allows arrow key navigation to submenu triggers', async () => {
				vi.useRealTimers();
				render(NavigationMenuNestedHarness);

				click(byId('trigger-1')!);
				await tick();

				const link1 = byId('popup-1')!.querySelector('a')!;
				link1.focus();

				await userEvent.keyboard('{ArrowDown}');
				expect(document.activeElement).toBe(byId('nested-trigger-1'));

				await userEvent.keyboard('{ArrowDown}');
				expect(document.activeElement).toBe(byId('nested-trigger-2'));

				await userEvent.keyboard('{ArrowUp}');
				expect(document.activeElement).toBe(byId('nested-trigger-1'));

				await userEvent.keyboard('{ArrowUp}');
				expect(document.activeElement).toBe(link1);
			});

			it('allows arrow key navigation with 3+ levels of nesting', async () => {
				vi.useRealTimers();
				render(NavigationMenuNestedHarness, { variant: 'deep' });

				click(byId('trigger-1')!);
				await tick();
				expect(byId('content-1')).not.toBeNull();

				const link1 = byId('link-1')!;
				link1.focus();

				await userEvent.keyboard('{ArrowDown}');
				expect(document.activeElement).toBe(byId('level2-trigger-1'));

				await userEvent.keyboard('{ArrowDown}');
				expect(document.activeElement).toBe(byId('level2-trigger-2'));

				await userEvent.keyboard('{ArrowUp}');
				expect(document.activeElement).toBe(byId('level2-trigger-1'));

				await userEvent.keyboard('{ArrowUp}');
				expect(document.activeElement).toBe(link1);

				const level2Link1 = byId('level2-link-1')!;
				level2Link1.focus();

				await userEvent.keyboard('{ArrowDown}');
				expect(document.activeElement).toBe(byId('level3-trigger-1'));

				await userEvent.keyboard('{ArrowDown}');
				expect(document.activeElement).toBe(byId('level3-trigger-2'));

				await userEvent.keyboard('{ArrowUp}');
				expect(document.activeElement).toBe(byId('level3-trigger-1'));

				await userEvent.keyboard('{ArrowUp}');
				expect(document.activeElement).toBe(level2Link1);
			});

			it('updates popup sizing when inline nested content is inserted while active', async () => {
				const restore = withAnimations();
				const restoreObserver = replaceResizeObserver(undefined);
				try {
					render(NavigationMenuNestedHarness, { variant: 'dynamic' });

					click(byId('trigger-1')!);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const animations = mockAnimations(popupRoot);
					let popupHeight = 120;
					mockSize(popupRoot, 'offsetWidth', () => 250);
					mockSize(popupRoot, 'offsetHeight', () => popupHeight);

					popupHeight = 220;
					animations.start();
					click(byId('insert-content')!);
					await flush();

					expect(byId('extra-content')).not.toBeNull();
					await expect.poll(() => cssPx(positioner, '--positioner-height')).toBe(220);

					await animations.finish();
					await flush();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toEqual({
							popupWidth: 'auto',
							popupHeight: 'auto',
							positionerWidth: '250px',
							positionerHeight: '220px'
						});
				} finally {
					restore();
					restoreObserver();
				}
			});

			it('does not animate popup sizing when nested default content mounts during opening', async () => {
				const restore = withAnimations();
				try {
					render(NavigationMenuNestedHarness);

					click(byId('trigger-1')!);
					flushSync();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const heights = [120, 220];
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => 250);
					mockSize(popupRoot, 'offsetHeight', () => {
						popupHeight = heights.shift() ?? popupHeight;
						return popupHeight;
					});

					await flush();

					expect(byId('nested-popup-1')).not.toBeNull();
					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toEqual({
							popupWidth: 'auto',
							popupHeight: 'auto',
							positionerWidth: '250px',
							positionerHeight: '220px'
						});
				} finally {
					restore();
				}
			});

			it('does not animate popup sizing when kept nested default content first moves into the portal', async () => {
				const restore = withAnimations();
				try {
					render(NavigationMenuNestedHarness, { keepMountedContent: true });

					click(byId('trigger-1')!);
					flushSync();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const setProperty = vi.spyOn(popupRoot.style, 'setProperty');
					const heights = [120, 220];
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => 250);
					mockSize(popupRoot, 'offsetHeight', () => {
						popupHeight = heights.shift() ?? popupHeight;
						return popupHeight;
					});

					await flush();

					expect(byId('nested-popup-1')!.hasAttribute('hidden')).toBe(false);
					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toEqual({
							popupWidth: 'auto',
							popupHeight: 'auto',
							positionerWidth: '250px',
							positionerHeight: '220px'
						});

					const fixedHeights = setProperty.mock.calls
						.filter((call) => call[0] === '--popup-height')
						.map((call) => call[1])
						.filter((value) => value !== 'auto' && value !== '0px');
					expect(fixedHeights.length).toBeGreaterThan(0);
					expect(fixedHeights.every((value) => value === '220px')).toBe(true);
				} finally {
					restore();
				}
			});

			it('updates popup sizing when switching kept inline nested content', async () => {
				const restore = withAnimations();
				const restoreObserver = replaceResizeObserver(InertResizeObserver);
				try {
					render(NavigationMenuNestedHarness, { keepMountedContent: true });

					click(byId('trigger-1')!);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const animations = mockAnimations(popupRoot);
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => 250);
					mockSize(popupRoot, 'offsetHeight', () => popupHeight);
					primeSize(popupRoot, positioner, ['auto', 'auto'], [250, 220]);

					popupHeight = 300;
					animations.start();
					click(byId('nested-trigger-2')!);
					await flush();

					expect(byId('nested-popup-2')!.hasAttribute('hidden')).toBe(false);
					await expect.poll(() => byId('nested-popup-1')!.hasAttribute('hidden')).toBe(true);
					await expect.poll(() => cssPx(positioner, '--positioner-height')).toBe(300);

					await animations.finish();
					await flush();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toEqual({
							popupWidth: 'auto',
							popupHeight: 'auto',
							positionerWidth: '250px',
							positionerHeight: '300px'
						});
				} finally {
					restore();
					restoreObserver();
				}
			});

			it('updates popup sizing when a kept nested content hidden attribute changes', async () => {
				const restore = withAnimations();
				const restoreObserver = replaceResizeObserver(InertResizeObserver);
				try {
					render(NavigationMenuNestedHarness, { keepMountedContent: true });

					click(byId('trigger-1')!);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => 250);
					mockSize(popupRoot, 'offsetHeight', () => popupHeight);
					primeSize(popupRoot, positioner, ['auto', 'auto'], [250, 220]);

					popupHeight = 300;
					byId('nested-popup-1')!.setAttribute('hidden', '');
					await flush();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toMatchObject({
							positionerWidth: '250px',
							positionerHeight: '300px'
						});
				} finally {
					restore();
					restoreObserver();
				}
			});

			it('keeps inline mutation resize interruptible when content updates again mid-transition', async () => {
				const restore = withAnimations();
				try {
					render(NavigationMenuNestedHarness, { variant: 'dynamic', initialContentStage: 1 });

					click(byId('trigger-1')!);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const animations = mockAnimations(popupRoot);
					const heights = [190, 260];
					let popupHeight = 260;
					mockSize(popupRoot, 'offsetWidth', () => 250);
					mockSize(popupRoot, 'offsetHeight', () => {
						popupHeight = heights.shift() ?? popupHeight;
						return popupHeight;
					});
					primeSize(popupRoot, positioner, ['250px', '220px'], [250, 220]);
					const setProperty = vi.spyOn(positioner.style, 'setProperty');

					animations.start();
					click(byId('insert-content')!);
					await flush();

					expect(byId('extra-content-2')).not.toBeNull();
					expect(
						setProperty.mock.calls.some(
							(call) => call[0] === '--positioner-height' && call[1] === '190px'
						)
					).toBe(true);

					await animations.finish();
					await flush();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toMatchObject({
							popupHeight: 'auto',
							positionerHeight: '260px'
						});
				} finally {
					restore();
				}
			});

			it('preserves the current size when an interrupted mutation temporarily measures zero', async () => {
				const restoreObserver = replaceResizeObserver(undefined);
				try {
					render(NavigationMenuNestedHarness, { variant: 'dynamic', initialContentStage: 1 });
					click(byId('trigger-1')!);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const widths = [250, 0];
					const heights = [220, 0];
					mockSize(popupRoot, 'offsetWidth', () => widths.shift() ?? 0);
					mockSize(popupRoot, 'offsetHeight', () => heights.shift() ?? 0);
					primeSize(popupRoot, positioner, ['250px', '220px'], [250, 220]);

					click(byId('insert-content')!);
					await flush();

					await expect.poll(() => popupRoot.style.getPropertyValue('--popup-width')).toBe('auto');
					await expect.poll(() => popupRoot.style.getPropertyValue('--popup-height')).toBe('auto');
					expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px');
					expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px');
				} finally {
					restoreObserver();
				}
			});

			it('updates popup sizing when the window is resized while the popup is open', async () => {
				const restoreObserver = replaceResizeObserver(InertResizeObserver);
				try {
					render(NavigationMenuSizingHarness);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					let popupWidth = 675;
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => popupWidth);
					mockSize(popupRoot, 'offsetHeight', () => popupHeight);
					primeSize(popupRoot, positioner, ['auto', 'auto'], [675, 220]);

					popupWidth = 500;
					popupHeight = 180;

					window.dispatchEvent(new Event('resize'));
					expect(positioner.hasAttribute('data-instant')).toBe(true);

					await advance(0);
					await tick();
					expect(positioner.hasAttribute('data-instant')).toBe(true);

					await advance(100);
					await tick();
					expect(positioner.hasAttribute('data-instant')).toBe(false);

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toEqual({
							popupWidth: 'auto',
							popupHeight: 'auto',
							positionerWidth: '500px',
							positionerHeight: '180px'
						});
				} finally {
					restoreObserver();
				}
			});

			it('updates popup sizing immediately when switching to a keepMounted trigger', async () => {
				const restore = withAnimations();
				const restoreObserver = replaceResizeObserver(InertResizeObserver);
				try {
					render(NavigationMenuSizingHarness);
					await flush();

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const animations = mockAnimations(popupRoot);
					let popupWidth = 675;
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => popupWidth);
					mockSize(popupRoot, 'offsetHeight', () => popupHeight);
					primeSize(popupRoot, positioner, ['auto', 'auto'], [675, 220]);

					popupWidth = 500;
					popupHeight = 180;
					animations.start();
					click(byId('trigger-learn')!);
					await flush();

					expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px');
					expect(positioner.style.getPropertyValue('--positioner-height')).toBe('180px');

					await animations.finish();
					await flush();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toEqual({
							popupWidth: 'auto',
							popupHeight: 'auto',
							positionerWidth: '500px',
							positionerHeight: '180px'
						});
				} finally {
					restore();
					restoreObserver();
				}
			});

			it('ignores the initial open size reset once a trigger switch has started', async () => {
				vi.useRealTimers();
				const restore = withAnimations();
				const restoreObserver = replaceResizeObserver(InertResizeObserver);
				try {
					render(NavigationMenuSizingHarness, { variant: 'keepMountedClosed' });

					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const animations = mockAnimations(popupRoot);
					const settle = async () => {
						await tick();
						await nextFrame();
						await nextFrame();
					};
					let popupWidth = 675;
					let popupHeight = 220;
					mockSize(popupRoot, 'offsetWidth', () => popupWidth);
					mockSize(popupRoot, 'offsetHeight', () => popupHeight);

					const openAnimation = animations.start();
					click(byId('trigger-product')!);
					await settle();

					popupWidth = 500;
					popupHeight = 180;

					const switchAnimation = animations.start();
					click(byId('trigger-learn')!);
					await settle();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toMatchObject({
							positionerWidth: '500px',
							positionerHeight: '180px'
						});

					await animations.finish(openAnimation);
					await settle();

					expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('500px');
					expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('180px');

					await animations.finish(switchAnimation);
					await settle();

					await expect
						.poll(() => sizeVars(popupRoot, positioner))
						.toMatchObject({
							popupWidth: 'auto',
							popupHeight: 'auto'
						});
				} finally {
					restore();
					restoreObserver();
				}
			});

			it('seeds the popup width from the exiting panel when reopening after hovering a top-level link', async () => {
				const restore = withAnimations();
				try {
					render(NavigationMenuSizingHarness, { variant: 'topLevelLinkScoped' });

					const triggerProduct = byId('trigger-product')!;
					const triggerLearn = byId('trigger-learn')!;
					const topLevelLink = byId('top-level-link')!;
					const popupRoot = byId('popup-root')!;
					const positioner = byId('positioner')!;
					const animations = mockAnimations(popupRoot);
					let nextPanelWidth = 675;
					let nextPanelHeight = 220;
					const fixedOr = (name: string, fallback: number) => {
						const fixed = popupRoot.style.getPropertyValue(name);
						return fixed && fixed !== 'auto' ? parseInt(fixed, 10) : fallback;
					};
					mockSize(popupRoot, 'offsetWidth', () => fixedOr('--popup-width', nextPanelWidth));
					mockSize(popupRoot, 'offsetHeight', () => fixedOr('--popup-height', nextPanelHeight));

					const openAnimation = animations.start();
					await hoverOpen(triggerProduct);
					await animations.finish(openAnimation);
					await flush();

					await expect.poll(() => popupRoot.style.getPropertyValue('--popup-width')).toBe('auto');
					expect(expanded('trigger-product')).toBe('true');

					const productContent = byId('popup-root')!.querySelector<HTMLElement>(
						'.test-navigation-menu-content'
					)!;
					const productAnimations = mockAnimations(productContent);
					const productCloseAnimation = productAnimations.start();

					const closeAnimation = animations.start();
					leave(triggerProduct, topLevelLink);
					await hoverOpen(topLevelLink);

					await expect.poll(() => expanded('trigger-product')).toBe('false');

					nextPanelWidth = 500;
					nextPanelHeight = 180;
					const setProperty = vi.spyOn(popupRoot.style, 'setProperty');

					const reopenAnimation = animations.start();
					await hoverOpen(triggerLearn);
					await nextFrame();
					await flush();

					const widthCalls = setProperty.mock.calls
						.filter((call) => call[0] === '--popup-width')
						.map((call) => call[1]);
					const exitingIndex = widthCalls.indexOf('675px');
					const reopeningIndex = widthCalls.lastIndexOf('500px');

					expect(expanded('trigger-learn')).toBe('true');
					expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px');
					expect(exitingIndex).toBeGreaterThan(-1);
					expect(reopeningIndex).toBeGreaterThan(exitingIndex);

					await productAnimations.finish(productCloseAnimation);
					await animations.finish(closeAnimation);
					await animations.finish(reopenAnimation);
					await flush();
				} finally {
					restore();
				}
			});

			it('closes on the short exit path after switching content', async () => {
				vi.useRealTimers();
				const restore = withAnimations();
				try {
					const onOpenChangeComplete = vi.fn();
					render(NavigationMenuSizingHarness, { variant: 'scopedExit', onOpenChangeComplete });

					const triggerProduct = byId('trigger-product')!;
					const triggerLearn = byId('trigger-learn')!;

					click(triggerProduct);
					await tick();

					const productContent = byId('popup-root')!.querySelector<HTMLElement>(
						'.test-navigation-menu-content'
					)!;
					const productAnimations = mockAnimations(productContent);
					const productCloseAnimation = productAnimations.start();

					click(triggerLearn);
					await tick();

					await expect.poll(() => expanded('trigger-learn')).toBe('true');
					expect(expanded('trigger-product')).toBe('false');
					const popupRoot = byId('popup-root')!;

					await nextFrame();
					await tick();
					await productAnimations.finish(productCloseAnimation);
					await tick();

					await expect
						.poll(() =>
							popupRoot.getAnimations().some((animation) => animation.playState !== 'finished')
						)
						.toBe(false);

					triggerLearn.focus();

					const closeStart = performance.now();
					triggerLearn.dispatchEvent(
						new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
					);

					await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[false]]);
					expect(performance.now() - closeStart).toBeLessThan(325);
				} finally {
					restore();
				}
			});

			it('does not collapse auto-sized popup to zero on close if measurement temporarily returns 0', async () => {
				render(NavigationMenuNestedHarness, { variant: 'dynamic' });
				const trigger1 = byId('trigger-1')!;

				// Upstream primes the open size with `style.setProperty`. A Svelte style write replaces
				// such values, so the mocked popup size is in place before opening and the menu
				// measures 250x120 itself.
				const isOpen = () => byId('popup-1')?.hasAttribute('data-open') ?? false;
				const restoreWidth = mockPrototypeSize('offsetWidth', () => (isOpen() ? 250 : 0));
				const restoreHeight = mockPrototypeSize('offsetHeight', () => (isOpen() ? 120 : 0));
				onTestFinished(() => {
					restoreWidth();
					restoreHeight();
				});

				click(trigger1);
				await flush();

				const popupRoot = byId('popup-root')!;
				const positioner = byId('positioner')!;
				await expect
					.poll(() => sizeVars(popupRoot, positioner))
					.toEqual({
						popupWidth: 'auto',
						popupHeight: 'auto',
						positionerWidth: '250px',
						positionerHeight: '120px'
					});

				mockSize(positioner, 'offsetWidth', () => 0);
				mockSize(positioner, 'offsetHeight', () => 0);

				trigger1.dispatchEvent(new FocusEvent('blur', { relatedTarget: document.body }));
				trigger1.dispatchEvent(
					new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })
				);
				await flush();

				expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('250px');
				expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('120px');
				expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px');
				expect(positioner.style.getPropertyValue('--positioner-height')).toBe('120px');
			});

			it('tabs from the last link of the last nested panel to the next top-level trigger', async () => {
				vi.useRealTimers();
				render(NavigationMenuNestedHarness, { variant: 'tabBoundary' });

				await userEvent.click(byId('trigger-1')!);
				await expect.poll(() => byId('nested-last-link')).not.toBeNull();

				const nestedLastLink = byId('nested-last-link')!;
				nestedLastLink.focus();
				expect(document.activeElement).toBe(nestedLastLink);

				await userEvent.tab();

				await expect.poll(() => document.activeElement).toBe(byId('trigger-2'));
				expect(byId('nested-popup-2')).not.toBeNull();
				expect(expanded('nested-trigger-2')).toBe('true');
			});

			it('tabs between nested triggers and links without opening inactive panels', async () => {
				vi.useRealTimers();
				render(NavigationMenuNestedHarness, { variant: 'tabFlow' });

				await userEvent.click(byId('trigger-product')!);
				await expect.poll(() => byId('nested-trigger-developers')).not.toBeNull();

				const developers = byId('nested-trigger-developers')!;
				developers.focus();
				expect(document.activeElement).toBe(developers);

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-link-get-started'));

				await userEvent.tab({ shift: true });
				expect(document.activeElement).toBe(developers);

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-link-get-started'));

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-link-composition'));

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-trigger-design-systems'));
				expect(byId('nested-popup-design-systems')).toBeNull();

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-trigger-engineering-leads'));
			});

			it('returns to the last inline submenu item when shift+tabbing after leaving it', async () => {
				vi.useRealTimers();
				render(NavigationMenuNestedHarness, { variant: 'tabFlow' });

				await userEvent.click(byId('trigger-product')!);
				await expect.poll(() => byId('nested-trigger-developers')).not.toBeNull();

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-trigger-developers'));

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-link-get-started'));

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-link-composition'));

				await userEvent.tab();
				expect(document.activeElement).toBe(byId('nested-trigger-design-systems'));

				await userEvent.tab({ shift: true });
				expect(document.activeElement).toBe(byId('nested-link-composition'));
			});
		});
	});
});
