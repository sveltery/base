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

/**
 * Tab stop before any item has registered. The first rendered item is the
 * stop. Once the list has nodes, registration order decides instead.
 */
export function renderOrderTabIndex(elements: readonly HTMLElement[], renderIndex: number): 0 | -1 {
	if (elements.length > 0) return -1;
	return renderIndex === 0 ? 0 : -1;
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
