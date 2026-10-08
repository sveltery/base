// Shared composite list for roving focus.
// Derived from Base UI v1.8.0 packages/react/src/internals/composite/list/CompositeList.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// The render-order counter lives here once. Each list resets it to the
// registered length when an item joins or leaves.

import { createAttachmentKey } from 'svelte/attachments';
import { includeSorted, RenderOrder } from './roving-slot.js';

export class CompositeItems<T extends HTMLElement = HTMLElement> {
	elements = $state<T[]>([]);
	protected readonly order = new RenderOrder();
	readonly attachmentKey = createAttachmentKey();

	claim() {
		return this.order.claim();
	}

	protected admit(node: T) {
		this.elements = includeSorted(this.elements, node);
		this.order.reset(this.elements.length);
	}

	protected dismiss(node: T) {
		const index = this.elements.indexOf(node);
		this.elements = this.elements.filter((item) => item !== node);
		this.order.reset(this.elements.length);
		return index;
	}
}
