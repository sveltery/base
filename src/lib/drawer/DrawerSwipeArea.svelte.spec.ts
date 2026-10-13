// Assertions follow Base UI v1.9.0 packages/react/src/drawer/swipe-area/DrawerSwipeArea.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: describeConformance, which no spec in this port runs, and the two cases that mock
// React's `useId` to return `undefined` first ($props.id() always has a value). The disable case
// keeps its end state but not its effect-phase check, which pins React's layout versus passive
// effect split. The pointerless virtual click uses `detail: 0`, which `isVirtualClick` reads as
// virtual, instead of mocking `isVirtualClick`.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { DialogStore } from '../dialog/store.svelte.js';
import DrawerSwipeAreaHarness from '../../tests/DrawerSwipeAreaHarness.svelte';
import { byTestId, firePointer, fireTouch } from '../../tests/drawer-gestures.js';

const cleanups: Array<() => void> = [];
afterEach(() => {
	while (cleanups.length > 0) cleanups.pop()!();
});

type Point = { x: number; y: number };

type SwipeOptions = {
	/** Receives the gesture's clock, so an injected event stays on the same timeline. */
	beforeRelease?: (nextTimeStamp: () => number) => Promise<unknown> | unknown;
	input?: 'pointer' | 'touch';
	pointerType?: 'mouse' | 'pen' | 'touch';
	timeStepMs?: number;
	startTimeMs?: number;
};

const area = () => byTestId('swipe-area');
const popup = () => byTestId('popup');

function nextMacrotask() {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, 0);
	});
}

// Every swipe runs on a fixed timeline. Wall-clock gaps would otherwise decide the release velocity.
async function swipe(element: HTMLElement, start: Point, end: Point, options: SwipeOptions = {}) {
	const step = {
		x: start.x + (end.x === start.x ? 0 : Math.sign(end.x - start.x)),
		y: start.y + (end.y === start.y ? 0 : Math.sign(end.y - start.y))
	};
	const {
		beforeRelease,
		input = 'pointer',
		pointerType = 'mouse',
		timeStepMs = 16,
		startTimeMs = 1
	} = options;
	let time = startTimeMs;
	const nextTimeStamp = () => (time += timeStepMs);

	if (input === 'touch') {
		fireTouch(element, 'touchstart', [start]);
		await tick();
		fireTouch(element, 'touchmove', [step]);
		await tick();
		fireTouch(element, 'touchmove', [end]);
		await tick();
		if (beforeRelease) {
			await beforeRelease(() => {
				throw new Error('Touch swipes do not carry timestamps.');
			});
			await tick();
		}
		fireTouch(element, 'touchend', [end]);
		await tick();
		return;
	}

	firePointer(element, 'pointerdown', { clientX: start.x, clientY: start.y, pointerType, time });
	await tick();
	firePointer(element, 'pointermove', {
		clientX: step.x,
		clientY: step.y,
		pointerType,
		time: nextTimeStamp()
	});
	await tick();
	firePointer(element, 'pointermove', {
		clientX: end.x,
		clientY: end.y,
		pointerType,
		time: nextTimeStamp()
	});
	await tick();
	if (beforeRelease) {
		await beforeRelease(nextTimeStamp);
		await tick();
	}
	firePointer(element, 'pointerup', {
		clientX: end.x,
		clientY: end.y,
		pointerType,
		time: nextTimeStamp()
	});
	await tick();
}

const swipeUp = (element: HTMLElement, startY: number, endY: number, options?: SwipeOptions) =>
	swipe(element, { x: 10, y: startY }, { x: 10, y: endY }, options);

const swipeLeft = (element: HTMLElement, startX: number, endX: number, options?: SwipeOptions) =>
	swipe(element, { x: startX, y: 10 }, { x: endX, y: 10 }, options);

// A real outside press begins with a `pointerdown`, which tells it apart from the gesture's own
// release click.
function pressOutside(target: Element = document.body) {
	firePointer(target, 'pointerdown', { pointerType: 'mouse' });
	firePointer(target, 'pointerup', { pointerType: 'mouse' });
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
}

function pressOutsideTouch(target: Element = document.body) {
	firePointer(target, 'pointerdown', { pointerType: 'touch' });
	fireTouch(target, 'touchstart', [{ x: 0, y: 0 }]);
	fireTouch(target, 'touchend', [{ x: 0, y: 0 }]);
	firePointer(target, 'pointerup', { pointerType: 'touch' });
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
}

function releaseClick(pointerType: string) {
	const click = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
	Object.defineProperty(click, 'pointerType', { value: pointerType });
	document.body.dispatchEvent(click);
}

function popupGone() {
	return expect.poll(() => document.querySelector('[data-testid="popup"]')).toBeNull();
}

function plainPointerEvent(
	type: string,
	init: { pointerType: string; buttons: number; x: number; y: number; cancelable?: boolean }
) {
	const event = new Event(type, { bubbles: true, cancelable: init.cancelable ?? true });
	Object.defineProperties(event, {
		pointerType: { value: init.pointerType },
		pointerId: { value: 1 },
		button: { value: 0 },
		buttons: { value: init.buttons },
		clientX: { value: init.x },
		clientY: { value: init.y }
	});
	return event;
}

describe('Drawer.SwipeArea', () => {
	it('opens the drawer when swiped in the open direction', async () => {
		render(DrawerSwipeAreaHarness, { portal: false });
		expect(area()).toHaveAttribute('data-closed', '');

		await swipeUp(area(), 120, 40);

		expect(area()).toHaveAttribute('data-open', '');
	});

	it('does not open when the swipe direction never locks to the open direction', async () => {
		const onOpenChange = vi.fn();
		render(DrawerSwipeAreaHarness, { portal: false, onOpenChange });

		await swipe(area(), { x: 10, y: 120 }, { x: 70, y: 118 });

		expect(area()).toHaveAttribute('data-closed', '');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('prevents default pointer down for non-touch swipes', async () => {
		render(DrawerSwipeAreaHarness, { portal: false });

		const notCanceled = firePointer(area(), 'pointerdown', { clientX: 10, clientY: 120 });

		expect(notCanceled).toBe(false);
	});

	it('does not open the drawer when disabled', async () => {
		render(DrawerSwipeAreaHarness, { portal: false, disabled: true });

		await swipeUp(area(), 120, 40);

		expect(area()).toHaveAttribute('data-closed', '');
	});

	it('respects custom swipeDirection', async () => {
		render(DrawerSwipeAreaHarness, { portal: false, swipeDirection: 'left' });

		await swipeLeft(area(), 120, 40);

		expect(area()).toHaveAttribute('data-open', '');
	});

	it('synchronizes overshoot styles across the popup, backdrop, and provider indent', async () => {
		render(DrawerSwipeAreaHarness, {
			provider: true,
			backdrop: true,
			swipeDirection: 'left',
			popupStyle: 'width: 100px; height: 100px'
		});
		const swipeArea = area();
		const indent = byTestId('indent');

		await swipeLeft(swipeArea, 200, -50, {
			async beforeRelease(nextTimeStamp) {
				const backdrop = byTestId('backdrop');
				expect(
					Number.parseFloat(popup().style.getPropertyValue('--drawer-swipe-movement-x'))
				).toBeCloseTo(-Math.sqrt(150));
				expect(popup().style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
				expect(popup().style.transition).toBe('none');
				expect(backdrop).toHaveAttribute('data-swiping', '');
				expect(backdrop.style.getPropertyValue('--drawer-height')).toBe('100px');
				expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('1');
				expect(indent.style.getPropertyValue('--drawer-height')).toBe('100px');

				firePointer(swipeArea, 'pointermove', { clientX: 200, clientY: 0, time: nextTimeStamp() });
				await tick();
				expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
				expect(indent.style.getPropertyValue('--drawer-height')).toBe('');

				firePointer(swipeArea, 'pointermove', { clientX: -50, clientY: 0, time: nextTimeStamp() });
				await tick();
			}
		});

		expect(byTestId('backdrop')).not.toHaveAttribute('data-swiping');
		expect(byTestId('backdrop').style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
		expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
		expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
	});

	it('opens from the rendered transform distance in either horizontal direction', async () => {
		render(DrawerSwipeAreaHarness, {
			rootSwipeDirection: 'left',
			swipeDirection: 'right',
			popupStyle: 'transform: matrix(1, 0, 0, 1, 60, 0); width: 100px'
		});

		await swipe(
			area(),
			{ x: 0, y: 10 },
			{ x: 40, y: 10 },
			{
				beforeRelease() {
					expect(
						Number.parseFloat(popup().style.getPropertyValue('--drawer-swipe-movement-x'))
					).toBeCloseTo(-20);
				}
			}
		);

		expect(area()).toHaveAttribute('data-open', '');
	});

	it('omits frontmost height when an opening drawer has no measured height', async () => {
		render(DrawerSwipeAreaHarness, {
			provider: true,
			backdrop: true,
			swipeDirection: 'left',
			popupStyle: 'width: 100px; height: 0; overflow: hidden'
		});

		await swipeLeft(area(), 100, 40, {
			beforeRelease() {
				expect(byTestId('backdrop').style.getPropertyValue('--drawer-height')).toBe('');
				expect(byTestId('indent').style.getPropertyValue('--drawer-height')).toBe('');
			}
		});
	});

	it('does not apply or close swipe state when a controlled parent rejects opening', async () => {
		const onOpenChange = vi.fn();
		render(DrawerSwipeAreaHarness, {
			rejectOpen: true,
			keepMounted: true,
			popupStyle: 'height: 100px',
			onOpenChange
		});
		await expect.poll(() => document.querySelector('[data-testid="popup"]')).not.toBeNull();

		await swipeUp(area(), 120, 110, { startTimeMs: 1000, timeStepMs: 1000 });

		expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
		expect(onOpenChange).not.toHaveBeenCalledWith(false, expect.anything());
		expect(popup()).not.toHaveAttribute('data-swiping');
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
	});

	it('cancels an active opening gesture when the swipe area becomes disabled', async () => {
		const screen = render(DrawerSwipeAreaHarness, {
			provider: true,
			popupStyle: 'height: 100px'
		});
		const swipeArea = area();

		firePointer(swipeArea, 'pointerdown', { clientX: 0, clientY: 100 });
		firePointer(swipeArea, 'pointermove', { clientX: 0, clientY: 99 });
		// React's act() mounts the popup inside the first move. Svelte mounts it on the next flush,
		// as a browser would between two pointer events.
		await tick();
		firePointer(swipeArea, 'pointermove', { clientX: 0, clientY: 60 });
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-swiping', '');

		await screen.rerender({ disabled: true });

		expect(popup()).not.toHaveAttribute('data-swiping');
		expect(swipeArea).toHaveAttribute('data-disabled', '');
		pressOutside();
		await popupGone();
	});

	it('keeps the drawer open when the release click follows a mid-gesture disable', async () => {
		const screen = render(DrawerSwipeAreaHarness);
		const swipeArea = area();

		firePointer(swipeArea, 'pointerdown', { clientX: 0, clientY: 100 });
		firePointer(swipeArea, 'pointermove', { clientX: 0, clientY: 99 });
		firePointer(swipeArea, 'pointermove', { clientX: 0, clientY: 40 });
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');

		await screen.rerender({ disabled: true });

		// The pointer is still down when `disabled` flips, so the release click has no fresh
		// `pointerdown`. It must not dismiss the drawer the gesture opened.
		releaseClick('mouse');
		await nextMacrotask();
		expect(popup()).toHaveAttribute('data-open', '');

		pressOutside();
		await popupGone();
	});

	it('does not prevent a non-cancelable pointer start', async () => {
		render(DrawerSwipeAreaHarness, { portal: false });
		const event = plainPointerEvent('pointerdown', {
			pointerType: 'mouse',
			buttons: 1,
			x: 0,
			y: 0,
			cancelable: false
		});
		const preventDefault = vi.spyOn(event, 'preventDefault');

		const dispatched = area().dispatchEvent(event);
		await tick();

		expect(dispatched).toBe(true);
		expect(event.defaultPrevented).toBe(false);
		expect(preventDefault).not.toHaveBeenCalled();
		firePointer(area(), 'pointercancel', {});
	});

	it('ignores compatibility touch pointer gestures with real displacement', async () => {
		const onOpenChange = vi.fn();
		render(DrawerSwipeAreaHarness, { portal: false, onOpenChange });
		const swipeArea = area();

		for (const [type, y] of [
			['pointerdown', 120],
			['pointermove', 40],
			['pointerup', 40],
			['pointercancel', 40]
		] as const) {
			const buttons = type === 'pointerup' || type === 'pointercancel' ? 0 : 1;
			swipeArea.dispatchEvent(plainPointerEvent(type, { pointerType: 'touch', buttons, x: 0, y }));
		}
		await tick();
		expect(onOpenChange).not.toHaveBeenCalled();

		firePointer(swipeArea, 'pointerdown', { clientX: 10, clientY: 120 });
		firePointer(swipeArea, 'pointercancel', { clientX: 10, clientY: 120 });

		expect(swipeArea).toHaveAttribute('data-closed', '');
		expect(swipeArea).not.toHaveAttribute('data-swiping');
	});

	it('follows a swipe area id change', async () => {
		let store: DialogStore<unknown> | undefined;
		const screen = render(DrawerSwipeAreaHarness, {
			portal: false,
			id: 'first',
			onStore: (next: DialogStore<unknown>) => (store = next)
		});
		const swipeArea = area();
		expect(store!.triggers.getById('first')).toBe(swipeArea);

		await screen.rerender({ id: 'second' });

		expect(store!.triggers.getById('first')).toBeUndefined();
		expect(store!.triggers.getById('second')).toBe(swipeArea);
		expect(store!.triggers.size).toBe(1);
	});

	it('opens the drawer when swiped with touch events', async () => {
		render(DrawerSwipeAreaHarness);

		await swipeUp(area(), 120, 40, { input: 'touch' });

		expect(area()).toHaveAttribute('data-open', '');
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');
	});

	it('applies data-swiping during an active swipe gesture', async () => {
		render(DrawerSwipeAreaHarness, { portal: false });
		const swipeArea = area();

		await swipeUp(swipeArea, 120, 40, {
			beforeRelease() {
				expect(swipeArea).toHaveAttribute('data-swiping', '');
			}
		});

		expect(swipeArea).not.toHaveAttribute('data-swiping');
	});

	it.each([
		['a mouse', pressOutside],
		['a touch', pressOutsideTouch]
	])(
		're-enables outside press dismissal for %s outside press after opening by swipe',
		async (_kind, press) => {
			render(DrawerSwipeAreaHarness);

			await swipeUp(area(), 120, 40, { input: 'touch' });
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');
			await nextMacrotask();

			press();
			await popupGone();
			expect(area()).toHaveAttribute('data-closed', '');
		}
	);

	it.each([
		{ input: 'pointer' as const, pointerType: 'mouse' as const },
		{ input: 'pointer' as const, pointerType: 'pen' as const },
		{ input: 'touch' as const, pointerType: 'touch' as const }
	])(
		'does not dismiss from the $pointerType/$input click synthesized by the swipe-open release',
		async ({ input, pointerType }) => {
			// Dragging past the popup releases outside it, so the gesture's pointerup synthesizes a
			// click over the backdrop, even a macrotask later.
			render(DrawerSwipeAreaHarness);

			await swipeUp(area(), 120, 40, { input, pointerType });
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');
			await nextMacrotask();

			releaseClick(pointerType);
			await nextMacrotask();

			expect(popup()).toHaveAttribute('data-open', '');
		}
	);

	it('suppresses a trusted release click that arrives without a preceding pointerdown', async () => {
		// Only trusted input runs a microtask checkpoint after each listener, which is the real
		// ordering between the release guard and the outside-press check. The `pointerdown` is
		// stopped at the window, ahead of document capture, so only the trusted `click` arrives.
		const stopPointerDown = (event: Event) => event.stopPropagation();
		cleanups.push(() => window.removeEventListener('pointerdown', stopPointerDown, true));
		render(DrawerSwipeAreaHarness, {
			outsideTarget: true,
			areaStyle: 'position: fixed; bottom: 0; left: 0; width: 100%; height: 40px',
			popupStyle: 'position: fixed; bottom: 0; left: 0; width: 100%; height: 150px'
		});

		await swipeUp(area(), 120, 40);
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');

		window.addEventListener('pointerdown', stopPointerDown, true);
		await userEvent.click(byTestId('outside-target'), { force: true });
		window.removeEventListener('pointerdown', stopPointerDown, true);
		await nextMacrotask();

		expect(popup()).toHaveAttribute('data-open', '');

		await userEvent.click(byTestId('outside-target'), { force: true });
		await popupGone();
	});

	it('allows a later click-only activation to dismiss after a swipe', async () => {
		render(DrawerSwipeAreaHarness, { outsideButton: true, modal: false, initialFocus: false });
		const outside = page.getByRole('button', { name: 'Outside' }).element() as HTMLElement;
		outside.focus();

		await swipeUp(area(), 120, 40);
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');
		expect(document.activeElement).toBe(outside);

		await userEvent.keyboard('{Enter}');

		await popupGone();
	});

	it('allows a later pointerless virtual click to dismiss when the release has no click', async () => {
		render(DrawerSwipeAreaHarness, { outsideButton: true, modal: false, initialFocus: false });

		await swipeUp(area(), 120, 40, { input: 'touch' });
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');

		page
			.getByRole('button', { name: 'Outside' })
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }));

		await popupGone();
	});

	it.each([false, true])(
		're-enables outside press dismissal after an interrupted swipe-open gesture (context menu: %s)',
		async (contextMenu) => {
			render(DrawerSwipeAreaHarness);
			const swipeArea = area();

			firePointer(swipeArea, 'pointerdown', { clientX: 10, clientY: 120 });
			await tick();
			firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 119 });
			await tick();
			firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 80 });
			await expect.element(page.getByTestId('popup')).toHaveAttribute('data-open', '');
			expect(swipeArea).toHaveAttribute('data-open', '');

			firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 60, buttons: 2 });
			await tick();
			if (contextMenu) {
				swipeArea.dispatchEvent(
					new MouseEvent('contextmenu', { bubbles: true, button: 2, clientX: 10, clientY: 60 })
				);
			}
			await nextMacrotask();

			pressOutside();
			await popupGone();
			if (!contextMenu) expect(swipeArea).toHaveAttribute('data-closed', '');
		}
	);

	it('uses a size-based swipe threshold by default', async () => {
		render(DrawerSwipeAreaHarness, { popupStyle: 'height: 200px' });
		// Past the 80ms flick-velocity window, so distance decides the outcome.
		const slowSwipe = { timeStepMs: 100 };

		await swipeUp(area(), 200, 130, slowSwipe);
		expect(area()).toHaveAttribute('data-closed', '');

		await swipeUp(area(), 200, 80, slowSwipe);
		expect(area()).toHaveAttribute('data-open', '');
	});

	it('keeps the swipe-area movement on the popup when re-grabbed during close', async () => {
		// The viewport's open reset would zero the movement the swipe area writes on the commit that
		// reopens the drawer, flashing it fully open. It only shows on a re-grab mid-exit.
		const style = document.head.appendChild(document.createElement('style'));
		style.textContent = `
			@keyframes swipe-regrab-exit { to { opacity: 0; } }
			.swipe-regrab-popup { height: 200px; }
			.swipe-regrab-popup[data-ending-style] { animation: swipe-regrab-exit 200ms; }
		`;
		cleanups.push(() => style.remove());
		render(DrawerSwipeAreaHarness, { popupClass: 'swipe-regrab-popup', close: true });
		const swipeArea = area();

		await swipeUp(swipeArea, 220, 20);
		expect(swipeArea).toHaveAttribute('data-open', '');
		const regrabbed = popup();

		(page.getByRole('button', { name: 'Close' }).element() as HTMLElement).click();
		await expect.element(regrabbed).toHaveAttribute('data-ending-style');

		// One move that locks the direction, reopens, and writes 200 - 80 = 120px of travel.
		firePointer(swipeArea, 'pointerdown', { clientX: 10, clientY: 120 });
		await tick();
		firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 40 });
		await tick();

		expect(swipeArea).toHaveAttribute('data-open', '');
		expect(regrabbed.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('120px');
	});

	it('opens on a quick flick whose only move is already released (buttons: 0)', async () => {
		// A fast flick can lift before the first move is sampled, so the only move has `buttons: 0`.
		render(DrawerSwipeAreaHarness);
		const swipeArea = area();

		firePointer(swipeArea, 'pointerdown', { clientX: 10, clientY: 120, time: 1 });
		await tick();
		firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 40, buttons: 0, time: 16 });
		await tick();

		expect(swipeArea).toHaveAttribute('data-open', '');
		expect(swipeArea).not.toHaveAttribute('data-swiping');
		pressOutside();
		await popupGone();
	});

	it('commits a released-move quick flick exactly once when a real pointerup trails it', async () => {
		const onOpenChange = vi.fn();
		render(DrawerSwipeAreaHarness, { onOpenChange });
		const swipeArea = area();

		firePointer(swipeArea, 'pointerdown', { clientX: 10, clientY: 120, time: 1 });
		await tick();
		firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 40, buttons: 0, time: 16 });
		await tick();
		expect(swipeArea).toHaveAttribute('data-open', '');
		expect(onOpenChange).toHaveBeenCalledTimes(1);
		expect(onOpenChange.mock.calls[0][0]).toBe(true);

		firePointer(swipeArea, 'pointerup', { clientX: 10, clientY: 40, time: 32 });
		await tick();

		expect(swipeArea).toHaveAttribute('data-open', '');
		expect(swipeArea).not.toHaveAttribute('data-swiping');
		expect(onOpenChange).toHaveBeenCalledTimes(1);
	});

	it('opens on a quick flick that lands its whole travel in a single touch move', async () => {
		render(DrawerSwipeAreaHarness, { portal: false });
		const swipeArea = area();

		fireTouch(swipeArea, 'touchstart', [{ x: 10, y: 120 }]);
		await tick();
		fireTouch(swipeArea, 'touchmove', [{ x: 10, y: 40 }]);
		await tick();
		fireTouch(swipeArea, 'touchend', [{ x: 10, y: 40 }]);
		await tick();

		expect(swipeArea).toHaveAttribute('data-open', '');
	});

	it('does not open on an in-place press-release without movement', async () => {
		const onOpenChange = vi.fn();
		render(DrawerSwipeAreaHarness, { portal: false, onOpenChange });
		const swipeArea = area();

		firePointer(swipeArea, 'pointerdown', { clientX: 10, clientY: 120, time: 1 });
		await tick();
		firePointer(swipeArea, 'pointermove', { clientX: 10, clientY: 120, buttons: 0, time: 16 });
		await tick();
		firePointer(swipeArea, 'pointerup', { clientX: 10, clientY: 120, time: 32 });
		await tick();

		expect(swipeArea).toHaveAttribute('data-closed', '');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('does not open a horizontal drawer on a stationary pointer move', async () => {
		const onOpenChange = vi.fn();
		render(DrawerSwipeAreaHarness, { portal: false, swipeDirection: 'left', onOpenChange });
		const swipeArea = area();

		firePointer(swipeArea, 'pointerdown', { clientX: 100, clientY: 10 });
		firePointer(swipeArea, 'pointermove', { clientX: 100, clientY: 10 });
		expect(onOpenChange).not.toHaveBeenCalled();

		firePointer(swipeArea, 'pointerup', { clientX: 100, clientY: 10 });
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
