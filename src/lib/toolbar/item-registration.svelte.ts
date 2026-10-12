// One toolbar item's node, render-order index, and registration cleanup.
// Derived from the item ref in Base UI v1.8.0
// packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type {
	CompositeHandlers,
	CompositeMeta,
	CompositeRoot
} from '../internal/composite-root.svelte.js';

export class ToolbarItem {
	#node = $state<HTMLElement | null>(null);
	readonly #renderIndex: number;

	constructor(
		private readonly roving: CompositeRoot,
		private readonly read: () => { disabled?: boolean } = () => ({})
	) {
		this.#renderIndex = roving.claim();
	}

	#register = (element: HTMLElement) => {
		this.#node = element;
		const remove = this.roving.register(element, this.read);
		return () => {
			remove();
			if (this.#node === element) this.#node = null;
		};
	};

	hosted(handlers: CompositeHandlers, meta: CompositeMeta = {}) {
		return this.roving.item(this.#node, this.#register, handlers, this.#renderIndex, meta);
	}
}
