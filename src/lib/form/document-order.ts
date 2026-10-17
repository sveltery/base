// Derived from `comesBeforeInSameTree` in Base UI v1.9.0 packages/react/src/form/Form.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

/**
 * True when `element` is before `reference` in the same tree.
 * Disconnected nodes (separate shadow roots) return false so the caller keeps
 * registration order, where document position is implementation-defined.
 */
export function comesBeforeInSameTree(element: Node, reference: Node) {
	const position = element.compareDocumentPosition(reference);
	return (
		(position & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 &&
		(position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
	);
}
