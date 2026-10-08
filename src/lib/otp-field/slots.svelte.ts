// Slot order for OTP Field, from the flat-list path of
// packages/react/src/internals/composite/list/CompositeList.tsx and useCompositeListItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// OTP Field does not use composite keyboard navigation. It only needs each input's
// DOM index, the same registration Toolbar and RadioGroup use for roving focus.
// An input that has not registered yet keeps the render-order index claimed at mount.

import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import { includeSorted, RenderOrder } from '../internal/roving-slot.js';

export class SlotList {
	elements = $state<HTMLInputElement[]>([]);
	readonly attachmentKey = createAttachmentKey();
	private readonly order = new RenderOrder();

	/** Render-order index for SSR, before the input is registered. */
	claim() {
		return this.order.claim();
	}

	get first(): HTMLInputElement | null {
		return this.elements[0] ?? null;
	}

	register(node: HTMLInputElement) {
		untrack(() => {
			this.elements = includeSorted(this.elements, node);
			this.order.reset(this.elements.length);
		});
		return () => {
			untrack(() => {
				this.elements = this.elements.filter((item) => item !== node);
				this.order.reset(this.elements.length);
			});
		};
	}
}
