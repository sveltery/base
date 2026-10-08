// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useHoverShared.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { isMouseLikePointerType } from '../utils/event.js';

export type HoverDelay = number | Partial<{ open: number; close: number }>;

function resolveValue<T>(
	value: T | (() => T) | undefined,
	pointerType?: string
): T | 0 | undefined {
	if (pointerType != null && !isMouseLikePointerType(pointerType)) return 0;
	if (typeof value === 'function') return (value as () => T)();
	return value;
}

export function getDelay(
	value: HoverDelay | (() => HoverDelay) | undefined,
	prop: 'open' | 'close',
	pointerType?: string
) {
	const result = resolveValue(value, pointerType);
	if (typeof result === 'number') return result;
	return result?.[prop];
}

export function getRestMs(value: number | (() => number)) {
	return typeof value === 'function' ? value() : value;
}

export function isClickLikeOpenEvent(openEventType: string | undefined, interactedInside: boolean) {
	return interactedInside || openEventType === 'click' || openEventType === 'mousedown';
}

export function isHoverOpenEvent(openEventType: string | undefined) {
	return !!openEventType?.includes('mouse') && openEventType !== 'mousedown';
}
