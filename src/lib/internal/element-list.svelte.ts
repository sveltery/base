// Ordered element registry for composite lists, tabs, accordion items, slider thumbs and OTP slots.
// Derived from Base UI v1.8.0 packages/react/src/internals/composite/list/CompositeList.tsx
// and useCompositeListItem.ts (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import { SvelteMap } from 'svelte/reactivity';

/** Sort key for elements in tree order. Equal elements compare equal. */
export function byDocumentOrder(a: Element, b: Element) {
	if (a === b) return 0;
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

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
 * Elements in document order. Each element can carry a getter for its live metadata.
 * Registration writes the sorted list, so a teardown that reads it after removing
 * an element sees the shorter list.
 */
export class ElementList<T extends Element = HTMLElement, Meta = undefined> {
	elements = $state.raw<T[]>([]);
	readonly attachmentKey = createAttachmentKey();
	readonly #meta = new SvelteMap<T, (() => Meta) | undefined>();
	readonly #order = new RenderOrder();

	/** Render-order index for SSR, before the element is registered. */
	claim() {
		return this.#order.claim();
	}

	/** Called from an attachment or effect. Nothing here subscribes the caller. */
	register(element: T, read?: () => Meta) {
		this.#meta.set(element, read);
		untrack(() => {
			if (!this.elements.includes(element)) {
				this.elements = [...this.elements, element].sort(byDocumentOrder);
			}
			this.#order.reset(this.elements.length);
		});
		return () => {
			untrack(() => {
				this.#meta.delete(element);
				this.elements = this.elements.filter((item) => item !== element);
				this.#order.reset(this.elements.length);
			});
		};
	}

	meta(element: T): Meta | undefined {
		return this.#meta.get(element)?.();
	}

	indexOf(element: T | null | undefined) {
		return element ? this.elements.indexOf(element) : -1;
	}

	get first(): T | null {
		return this.elements[0] ?? null;
	}

	/** Follow a keyed move that did not register or remove anything. */
	refreshOrder() {
		const sorted = [...this.elements].sort(byDocumentOrder);
		if (sorted.some((element, index) => element !== this.elements[index])) this.elements = sorted;
	}
}
