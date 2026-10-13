// Synthetic mouse sequences that match what @testing-library/user-event dispatches upstream.
// Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export function mouse(target: Element, type: string, init: MouseEventInit = {}) {
	target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
}

export function pointer(target: Element, type: string, init: PointerEventInit = {}) {
	target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, ...init }));
}

/** Upstream `enterWithMouse`. */
export function enterWithMouse(target: Element) {
	pointer(target, 'pointerenter', { pointerType: 'mouse', bubbles: false });
	mouse(target, 'mouseenter', { bubbles: false });
	mouse(target, 'mousemove');
}

/** Upstream `moveMouse`. */
export function moveMouse(from: Element, to: Element) {
	pointer(from, 'pointerleave', { pointerType: 'mouse', relatedTarget: to, bubbles: false });
	mouse(from, 'mouseleave', { relatedTarget: to, bubbles: false });
	pointer(to, 'pointerenter', { pointerType: 'mouse', relatedTarget: from, bubbles: false });
	mouse(to, 'mouseenter', { relatedTarget: from, bubbles: false });
	mouse(to, 'mousemove');
}

/** user-event `unhover`: the pointer leaves for the body at the page origin. */
export function leaveToBody(from: Element) {
	const init = { relatedTarget: document.body, clientX: 0, clientY: 0, bubbles: false };
	pointer(from, 'pointerleave', { pointerType: 'mouse', ...init });
	mouse(from, 'mouseleave', init);
	mouse(document.body, 'mousemove', { clientX: 0, clientY: 0 });
}

/**
 * user-event `click`: the press lands on the element itself, not on whatever covers its
 * position, such as a modal menu's backdrop.
 */
export function clickElement(target: HTMLElement) {
	const init = { pointerType: 'mouse', isPrimary: true, button: 0, detail: 1 };
	pointer(target, 'pointerdown', { ...init, buttons: 1 });
	mouse(target, 'mousedown', { ...init, buttons: 1 });
	target.focus();
	pointer(target, 'pointerup', init);
	mouse(target, 'mouseup', init);
	mouse(target, 'click', init);
}
