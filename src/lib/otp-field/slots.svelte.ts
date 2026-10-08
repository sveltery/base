// Slot order for OTP Field, from the flat-list path of
// packages/react/src/internals/composite/list/CompositeList.tsx and useCompositeListItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// OTP Field does not use composite keyboard navigation. It only needs each input's
// DOM index, the same registration Toolbar and RadioGroup use for roving focus.
// An input that has not registered yet takes the index it will have in document order.

import { untrack } from 'svelte';
import { includeSorted } from '../internal/roving-slot.js';
import { createAttachmentKey } from 'svelte/attachments';

export class SlotList {
	elements = $state<HTMLInputElement[]>([]);
	readonly attachmentKey = createAttachmentKey();

	get first(): HTMLInputElement | null {
		return this.elements[0] ?? null;
	}

	indexOf(node: HTMLInputElement | null): number {
		if (!node) return this.elements.length;
		const index = this.elements.indexOf(node);
		if (index >= 0) return index;
		if (!node.isConnected) return this.elements.length;
		let preceding = 0;
		for (const item of this.elements) {
			if (node.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_PRECEDING) preceding += 1;
		}
		return preceding;
	}

	register(node: HTMLInputElement) {
		untrack(() => {
			this.elements = includeSorted(this.elements, node);
		});
		return () => {
			untrack(() => {
				this.elements = this.elements.filter((item) => item !== node);
			});
		};
	}
}
