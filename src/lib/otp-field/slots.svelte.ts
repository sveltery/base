// Slot order for OTP Field, from the flat-list path of
// packages/react/src/internals/composite/list/CompositeList.tsx and useCompositeListItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// OTP Field does not use composite keyboard navigation. It only needs each input's
// DOM index, the same registration Toolbar and RadioGroup use for roving focus.
// Indexes are claimed in render order for SSR, then corrected to document order.

import { untrack } from 'svelte';
import { byDocumentOrder } from '../internal/document-order.js';
import { createAttachmentKey } from 'svelte/attachments';

export class SlotList {
	elements = $state<HTMLInputElement[]>([]);
	private nextSlot = 0;
	readonly attachmentKey = createAttachmentKey();

	/** Render-order slot used before the input is in the document (SSR). */
	claim() {
		const slot = this.nextSlot;
		this.nextSlot += 1;
		return slot;
	}

	get first(): HTMLInputElement | null {
		return this.elements[0] ?? null;
	}

	indexOf(node: HTMLInputElement | null, fallback: number) {
		if (!node) return fallback;
		const index = this.elements.indexOf(node);
		return index < 0 ? fallback : index;
	}

	register(node: HTMLInputElement) {
		untrack(() => {
			if (!this.elements.includes(node)) {
				this.elements = [...this.elements, node].sort(byDocumentOrder);
			}
		});
		return () => {
			untrack(() => {
				this.elements = this.elements.filter((item) => item !== node);
			});
		};
	}
}
