// Synthetic right-click and touch gestures that match what upstream's `fireEvent` dispatches.
// Derived from Base UI v1.9.0 packages/react/src/context-menu/trigger/ContextMenuTrigger.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { mouse } from '../menu/mouse.js';

/** Upstream `fireEvent.contextMenu`. Returns the event so a test can read `defaultPrevented`. */
export function contextMenu(target: Element, init: MouseEventInit = {}) {
	const event = new MouseEvent('contextmenu', {
		bubbles: true,
		cancelable: true,
		button: 2,
		...init
	});
	target.dispatchEvent(event);
	return event;
}

/** A right button release, as `fireEvent.mouseUp(target, { button: 2, ... })`. */
export function rightMouseUp(target: Element, init: MouseEventInit = {}) {
	mouse(target, 'mouseup', { button: 2, ...init });
}

export function touchPoint(target: Element, x: number, y: number, identifier = 0) {
	return new Touch({ identifier, target, clientX: x, clientY: y });
}

export function touch(target: Element, type: string, touches: Touch[] = []) {
	target.dispatchEvent(
		new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches: touches })
	);
}
