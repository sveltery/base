import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { OPEN_DELAY } from '../lib/navigation-menu/constants.js';
import { advance, byId, enter } from './previewCardEvents.js';

type View = { BASE_UI_ANIMATIONS_DISABLED?: boolean };

/**
 * Resolves with `read()` once it returns `expected`, or with its last value after `timeout`.
 * It checks on every DOM mutation as well as on a timer, like Testing Library's `waitFor`,
 * so it sees a value that lasts only a frame or two.
 */
export function observeValue<T>(read: () => T, expected: T, timeout = 2000): Promise<T> {
	return new Promise((resolve) => {
		let last = read();
		if (Object.is(last, expected)) {
			resolve(last);
			return;
		}
		const check = () => {
			last = read();
			if (!Object.is(last, expected)) return;
			finish();
		};
		const observer = new MutationObserver(check);
		observer.observe(document.documentElement, {
			attributes: true,
			childList: true,
			subtree: true,
			characterData: true
		});
		// eslint-disable-next-line sveltery/no-unscoped-timer -- a test wait, no component owns it
		const interval = setInterval(check, 16);
		// eslint-disable-next-line sveltery/no-unscoped-timer -- a test wait, no component owns it
		const timer = setTimeout(finish, timeout);
		function finish() {
			observer.disconnect();
			clearInterval(interval);
			clearTimeout(timer);
			resolve(last);
		}
	});
}

/** Hovers with the real pointer. `force` skips the hit-target check the safe polygon lock fails. */
export function hoverForce(element: Element) {
	return userEvent.hover(element, { force: true } as never);
}

let hovered: Element | null = null;

function center(element: Element) {
	const rect = element.getBoundingClientRect();
	return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
}

/**
 * Hover events the way Testing Library's `user.hover` dispatches them with
 * `pointerEventsCheck: 0`: leave events on the last hovered element, then enter and move
 * events on `element`, whatever `pointer-events` the page sets. A real pointer cannot
 * reach a trigger while the safe polygon locks the list.
 */
export function hover(element: Element, pointerType = 'mouse') {
	const init = { ...center(element), pointerType, bubbles: true, cancelable: true };
	if (hovered && hovered !== element && hovered.isConnected) unhover(hovered, element);
	hovered = element;
	element.dispatchEvent(new PointerEvent('pointerover', init));
	element.dispatchEvent(new PointerEvent('pointerenter', { ...init, bubbles: false }));
	element.dispatchEvent(new MouseEvent('mouseover', init));
	element.dispatchEvent(new MouseEvent('mouseenter', { ...init, bubbles: false }));
	element.dispatchEvent(new PointerEvent('pointermove', init));
	element.dispatchEvent(new MouseEvent('mousemove', init));
}

/** Leave events on `element`, the way `user.unhover` dispatches them. */
export function unhover(element: Element, relatedTarget: Element | null = null) {
	const init = { ...center(element), pointerType: 'mouse', bubbles: true, relatedTarget };
	if (hovered === element) hovered = null;
	element.dispatchEvent(new PointerEvent('pointermove', init));
	element.dispatchEvent(new MouseEvent('mousemove', init));
	element.dispatchEvent(new PointerEvent('pointerout', init));
	element.dispatchEvent(new PointerEvent('pointerleave', { ...init, bubbles: false }));
	element.dispatchEvent(new MouseEvent('mouseout', init));
	element.dispatchEvent(new MouseEvent('mouseleave', { ...init, bubbles: false }));
}

/** Forgets the hovered element between tests. */
export function resetHover() {
	hovered = null;
}

export function pointer(element: Element, type: string, pointerType: string) {
	element.dispatchEvent(
		new PointerEvent(type, { pointerType, bubbles: type !== 'pointerenter', button: 0 })
	);
}

export function keyDown(element: Element, key: string, init: KeyboardEventInit = {}) {
	element.dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
	);
}

export function isVisible(element: HTMLElement | null) {
	return element != null && element.checkVisibility();
}

export async function flush() {
	await tick();
	await advance(0);
}

export function click(element: Element) {
	element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
}

export function touchClick(element: Element) {
	pointer(element, 'pointerdown', 'touch');
	pointer(element, 'pointerup', 'touch');
	click(element);
}

export async function hoverOpen(element: Element, ms = OPEN_DELAY) {
	enter(element);
	await advance(ms);
	await flush();
}

export function expanded(testId: string) {
	return byId(testId)!.getAttribute('aria-expanded');
}

export function mockBoundingClientRect(
	element: Element,
	rect: { x: number; y: number; width: number; height: number }
) {
	const domRect = {
		...rect,
		top: rect.y,
		left: rect.x,
		right: rect.x + rect.width,
		bottom: rect.y + rect.height,
		toJSON: () => ({})
	};
	Object.defineProperty(element, 'getBoundingClientRect', {
		configurable: true,
		value: () => domRect
	});
}

export function mockAnimations(element: HTMLElement) {
	type MockAnimation = { finished: Promise<void>; resolveFinished: (() => void) | null };
	function createAnimation(): MockAnimation {
		let resolveFinished: (() => void) | null = null;
		const finished = new Promise<void>((resolve) => {
			resolveFinished = resolve;
		});
		return { finished, resolveFinished };
	}
	let current = createAnimation();
	let active: MockAnimation[] = [];
	Object.defineProperty(element, 'getAnimations', {
		configurable: true,
		value: () => active.map((animation) => ({ finished: animation.finished }))
	});
	return {
		start() {
			current = createAnimation();
			active.push(current);
			return current;
		},
		finish(animation: MockAnimation = current) {
			animation.resolveFinished?.();
			animation.resolveFinished = null;
			active = active.filter((item) => item !== animation);
			return animation.finished;
		}
	};
}

export function withAnimations() {
	const view = globalThis as View;
	const previous = view.BASE_UI_ANIMATIONS_DISABLED;
	view.BASE_UI_ANIMATIONS_DISABLED = false;
	return () => {
		view.BASE_UI_ANIMATIONS_DISABLED = previous;
	};
}
