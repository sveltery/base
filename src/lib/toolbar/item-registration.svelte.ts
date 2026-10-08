// One toolbar item's node, render-order index, and registration cleanup.
// Derived from the item ref in Base UI v1.8.0
// packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { ToolbarRoving, ToolbarRovingHandlers } from '../internal/toolbar-roving.svelte.js';

export function registerToolbarItem(roving: ToolbarRoving) {
	let node = $state<HTMLElement | null>(null);
	const renderIndex = roving.claim();

	function register(element: HTMLElement) {
		node = element;
		const remove = roving.register(element);
		return () => {
			remove();
			if (node === element) node = null;
		};
	}

	function hosted(handlers: ToolbarRovingHandlers) {
		const props = roving.item(node, register, handlers, renderIndex);
		return { props, attachmentKey: roving.keyForAttachment() };
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
