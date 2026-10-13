// Toast-local helpers.
// Derived from Base UI v1.9.0 packages/react/src/toast/utils/isRenderableNode.ts,
// packages/react/src/toast/utils/resolvePromiseOptions.ts, packages/utils/src/generateId.ts,
// `matchesFocusVisible` in packages/react/src/floating-ui-react/utils/element.ts,
// `closest` in packages/utils/src/shadowDom.ts,
// `getDisplacement` in packages/react/src/utils/useSwipeDismiss.ts,
// packages/react/src/utils/getElementTransform.ts, and the swipe-ignore selectors in
// packages/react/src/internals/constants.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// `getElementTransform` keeps upstream's scale, which `src/lib/internal/getElementTransform.ts`
// does not return. `isRenderable` takes a string or a snippet. A snippet always renders.

import { isElement, isNode, isShadowRoot } from '@floating-ui/utils/dom';
import { ownerWindow } from '@sveltery/utils';
import type { ToastManagerUpdateOptions, ToastNode, ToastSwipeDirection } from './types.js';

let counter = 0;

export function generateId(prefix: string) {
	counter += 1;
	return `${prefix}-${Math.random().toString(36).slice(2, 6)}-${counter}`;
}

export function isRenderable(node: ToastNode | null | undefined | boolean): node is ToastNode {
	return node != null && typeof node !== 'boolean' && node !== '';
}

export function resolvePromiseOptions<T, Data extends object>(
	options:
		| string
		| ToastManagerUpdateOptions<Data>
		| ((result: T) => string | ToastManagerUpdateOptions<Data>),
	result?: T
): ToastManagerUpdateOptions<Data> {
	if (typeof options === 'string') {
		return { description: options };
	}
	if (typeof options === 'function') {
		const resolved = options(result as T);
		return typeof resolved === 'string' ? { description: resolved } : resolved;
	}
	return options;
}

export function isFocusVisible(element: Element | null) {
	if (!element) return true;
	try {
		return element.matches(':focus-visible');
	} catch {
		return true;
	}
}

/** `Element.closest` across slots and shadow roots. */
export function closest(node: EventTarget | null | undefined, selector: string): Element | null {
	let current: Node | null = isNode(node) ? node : null;
	while (current) {
		if (isElement(current) && current.matches(selector)) return current;
		current =
			(isElement(current) ? current.assignedSlot : null) ??
			current.parentNode ??
			(isShadowRoot(current) ? current.host : null);
	}
	return null;
}

export const TOAST_SWIPE_IGNORE_SELECTOR = '[data-base-ui-swipe-ignore],[data-swipe-ignore]';

export function getDisplacement(direction: ToastSwipeDirection, deltaX: number, deltaY: number) {
	switch (direction) {
		case 'up':
			return -deltaY;
		case 'down':
			return deltaY;
		case 'left':
			return -deltaX;
		case 'right':
			return deltaX;
		default:
			return 0;
	}
}

export function getElementTransform(element: HTMLElement) {
	const transform = ownerWindow(element).getComputedStyle(element).transform;
	let x = 0;
	let y = 0;
	let scale = 1;
	if (transform && transform !== 'none') {
		const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
		if (matrix) {
			const values = matrix[1].split(', ').map(parseFloat);
			if (values.length === 6) {
				x = values[4];
				y = values[5];
				scale = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
			} else if (values.length === 16) {
				x = values[12];
				y = values[13];
				scale = values[0];
			}
		}
	}
	return { x, y, scale };
}
