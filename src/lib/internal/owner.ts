// Derived from Base UI v1.8.0 packages/utils/src/owner.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function ownerDocument(node: Node | null | undefined): Document {
	return node?.ownerDocument ?? document;
}

export function ownerWindow(node: Node | null | undefined): Window & typeof globalThis {
	const view = ownerDocument(node).defaultView;
	return view ?? window;
}
