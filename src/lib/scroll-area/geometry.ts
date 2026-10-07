// Derived from Base UI v1.8.0 packages/react/src/utils/scrollEdges.ts
// and the pure helpers in ScrollAreaRoot.tsx / ScrollAreaViewport.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { clamp } from '../internal/clamp.js';
import { MIN_THUMB_SIZE } from './constants.js';
import type { HiddenState, OverflowEdgeThreshold } from './types.js';

export const SCROLL_EDGE_TOLERANCE_PX = 1;

export function normalizeScrollOffset(value: number, max: number) {
	if (max <= 0) {
		return 0;
	}

	const clamped = clamp(value, 0, max);
	const startDistance = clamped;
	const endDistance = max - clamped;
	const withinStartTolerance = startDistance <= SCROLL_EDGE_TOLERANCE_PX;
	const withinEndTolerance = endDistance <= SCROLL_EDGE_TOLERANCE_PX;

	if (withinStartTolerance && withinEndTolerance) {
		return startDistance <= endDistance ? 0 : max;
	}

	if (withinStartTolerance) {
		return 0;
	}

	if (withinEndTolerance) {
		return max;
	}

	return clamped;
}

export function normalizeOverflowEdgeThreshold(threshold: OverflowEdgeThreshold | undefined) {
	const thresholds =
		typeof threshold === 'number'
			? { xStart: threshold, xEnd: threshold, yStart: threshold, yEnd: threshold }
			: threshold;

	return {
		xStart: Math.max(0, thresholds?.xStart || 0),
		xEnd: Math.max(0, thresholds?.xEnd || 0),
		yStart: Math.max(0, thresholds?.yStart || 0),
		yEnd: Math.max(0, thresholds?.yEnd || 0)
	};
}

/** Returns `prev` when `next` is shallow-equal so scroll-frame updates do not replace state. */
export function pickState<T extends object>(prev: T, next: T): T {
	for (const key in next) {
		if (prev[key as keyof T] !== next[key as keyof T]) {
			return next;
		}
	}

	return prev;
}

export function getHiddenState(viewport: HTMLElement): HiddenState {
	const y = viewport.clientHeight >= viewport.scrollHeight;
	const x = viewport.clientWidth >= viewport.scrollWidth;

	return {
		y,
		x,
		corner: y || x
	};
}

/**
 * Sizes the thumb and returns its axis offset. On overscroll (Safari rubber-band only) it shrinks
 * against the pinned edge, damped by `content / (content + overscroll)`.
 * An empty size override removes the inline variable so the resting `var(...)` applies.
 */
export function applyOverscrollThumb(
	scrollFromStart: number,
	maxScroll: number,
	content: number,
	size: number,
	maxThumbOffset: number
): { offset: number; sizeOverride: string } {
	const clamped = clamp(scrollFromStart, 0, maxScroll);
	const overscroll = scrollFromStart - clamped;
	const nextSize = Math.max(MIN_THUMB_SIZE, (size * content) / (content + Math.abs(overscroll)));
	const offset = maxScroll ? (clamped / maxScroll) * maxThumbOffset : 0;

	return {
		offset: offset + (overscroll > 0 ? size - nextSize : 0),
		sizeOverride: overscroll ? `${nextSize}px` : ''
	};
}
