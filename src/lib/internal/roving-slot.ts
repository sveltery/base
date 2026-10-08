// Derived from Base UI v1.8.0 packages/react/src/internals/composite/list/useCompositeListItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Tabs still claims a render-order slot. Toolbar, Toggle Group, Radio Group, and
// OTP Field take their fallback stop from registration order instead.

import { byDocumentOrder } from './document-order.js';

/** Render-order slot. The counter does not reset; prefer `registeredTabIndex`. */
export function createSlotClaim() {
	let nextSlot = 0;
	return () => {
		const slot = nextSlot;
		nextSlot += 1;
		return slot;
	};
}

/**
 * Tab index from registration order. The highlighted element wins; otherwise
 * the first registered element is the only tab stop. An element that has not
 * registered yet is not a stop.
 */
export function registeredTabIndex(
	elements: readonly HTMLElement[],
	node: HTMLElement | null,
	stop: HTMLElement | null
): 0 | -1 {
	if (!node || elements.length === 0) return -1;
	const target = stop && elements.includes(stop) ? stop : elements[0];
	return node === target ? 0 : -1;
}

export function includeSorted<T extends HTMLElement>(elements: T[], node: T): T[] {
	if (elements.includes(node)) return elements;
	return [...elements, node].sort(byDocumentOrder);
}
