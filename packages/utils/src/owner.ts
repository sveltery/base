// Derived from Base UI v1.9.0 packages/utils/src/owner.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export function ownerDocument(node: Node | null | undefined): Document {
	return node?.ownerDocument ?? document;
}

export function ownerWindow(node: Node | null | undefined): Window & typeof globalThis {
	const view = ownerDocument(node).defaultView;
	return view ?? window;
}
