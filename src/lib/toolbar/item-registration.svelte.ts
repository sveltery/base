// One toolbar item's node, render-order index, and registration cleanup.
// Derived from the item ref in Base UI v1.8.0
// packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import type {
	CompositeHandlers,
	CompositeMeta,
	CompositeRoot,
	RenderClaim
} from '../internal/composite-root.svelte.js';

export class ToolbarItem {
	#node = $state<HTMLElement | null>(null);
	readonly #claim: RenderClaim;

	constructor(
		private readonly roving: CompositeRoot,
		private readonly read: () => { disabled?: boolean } = () => ({})
	) {
		this.#claim = roving.claim(Boolean(untrack(read).disabled));
	}

	#register = (element: HTMLElement) => {
		this.#node = element;
		const remove = this.roving.register(element, this.read, this.#claim);
		return () => {
			remove();
			if (this.#node === element) this.#node = null;
		};
	};

	hosted(handlers: CompositeHandlers, meta: CompositeMeta = {}) {
		return this.roving.item(this.#node, this.#register, handlers, this.#claim, meta);
	}
}
