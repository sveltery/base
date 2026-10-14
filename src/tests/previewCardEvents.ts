import { vi } from 'vitest';

export function byId(testId: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
}

export function dispatch(element: Element, type: string, init: MouseEventInit = {}) {
	const bubbles = type !== 'mouseenter' && type !== 'mouseleave';
	element.dispatchEvent(new MouseEvent(type, { bubbles, ...init }));
}

export function pointerDown(element: Element) {
	element.dispatchEvent(
		new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true, button: 0 })
	);
}

export function enter(element: Element) {
	dispatch(element, 'mouseenter');
	dispatch(element, 'mousemove');
}

export function leave(element: Element, relatedTarget?: Element) {
	dispatch(element, 'mouseleave', { relatedTarget });
}

export function hover(element: Element) {
	pointerDown(element);
	enter(element);
}

export function advance(ms: number) {
	return vi.advanceTimersByTimeAsync(ms);
}

/** Unmounting during a position computation makes it read signals of the destroyed positioner. */
export function settlePositioning() {
	// eslint-disable-next-line sveltery/no-unscoped-timer -- a test wait, no component owns it
	return new Promise((resolve) => setTimeout(resolve, 100));
}
