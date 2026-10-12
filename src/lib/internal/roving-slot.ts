// Derived from Base UI v1.8.0 packages/react/src/internals/composite/list/useCompositeListItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `RenderOrder` starts at 0 when the list mounts and returns to the registered
// length after each flush, including after the last item leaves.

import { byDocumentOrder } from './document-order.js';

/**
 * Guess each item's index from render order, including SSR, before the node
 * is registered. Upstream `nextIndexRef` starts at 0 for the list mount and
 * is set to the registered length after each flush.
 */
export class RenderOrder {
	private next = 0;

	claim(): number {
		const index = this.next;
		this.next += 1;
		return index;
	}

	reset(length: number) {
		this.next = length;
	}
}

export function includeSorted<T extends HTMLElement>(elements: T[], node: T): T[] {
	if (elements.includes(node)) return elements;
	return [...elements, node].sort(byDocumentOrder);
}
