// Derived from Base UI v1.8.0 packages/react/src/internals/composite/list/useCompositeListItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Tabs, Toolbar, Toggle Group, Radio Group, and OTP Field share this slot claim.

import { byDocumentOrder } from './document-order.js';

/** Render-order slot used for tabindex before the attachment runs (SSR). */
export function createSlotClaim() {
	let nextSlot = 0;
	return () => {
		const slot = nextSlot;
		nextSlot += 1;
		return slot;
	};
}

export function includeSorted<T extends HTMLElement>(elements: T[], node: T): T[] {
	if (elements.includes(node)) return elements;
	return [...elements, node].sort(byDocumentOrder);
}
