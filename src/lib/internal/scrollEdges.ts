// Derived from Base UI v1.8.0 packages/react/src/utils/scrollEdges.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { clamp } from './clamp.js';

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
