// Toast-local helpers.
// Derived from Base UI v1.9.0 packages/react/src/toast/utils/isRenderableNode.ts,
// packages/react/src/toast/utils/resolvePromiseOptions.ts, packages/utils/src/generateId.ts,
// `getDisplacement` in packages/react/src/utils/useSwipeDismiss.ts, and the swipe-ignore
// selectors in packages/react/src/internals/constants.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `isRenderable` takes a string or a snippet. A snippet always renders.

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
