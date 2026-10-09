// One toolbar item's node, render-order index, and registration cleanup.
// Derived from the item ref in Base UI v1.8.0
// packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type {
	CompositeHandlers,
	CompositeMeta,
	CompositeRoot
} from '../internal/composite-root.svelte.js';

export function registerToolbarItem(
	roving: CompositeRoot,
	read: () => { disabled?: boolean } = () => ({})
) {
	let node = $state<HTMLElement | null>(null);
	const renderIndex = roving.claim(Boolean(read().disabled));

	function register(element: HTMLElement) {
		node = element;
		const remove = roving.register(element, read, renderIndex);
		return () => {
			remove();
			if (node === element) node = null;
		};
	}

	function hosted<T extends HTMLElement = HTMLElement>(
		handlers: CompositeHandlers<T>,
		meta: CompositeMeta = {}
	) {
		return roving.item<T>(node, register, handlers, renderIndex, meta);
	}

	return {
		get node() {
			return node;
		},
		renderIndex,
		register,
		hosted
	};
}
