// Derived from Base UI v1.9.0 packages/react/src/utils/getElementAtPoint.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

type ElementFromPointRoot = Node & Partial<Pick<Document, 'elementFromPoint'>>;

// `Document.elementFromPoint` retargets shadow content to the shadow host, which then fails
// `contains()` checks against a popup inside that shadow root, so callers pass `getRootNode()`
// (a document or a shadow root) rather than `ownerDocument()`.
export function getElementAtPoint(
	root: ElementFromPointRoot | null | undefined,
	x: number,
	y: number
): Element | null {
	return typeof root?.elementFromPoint === 'function' ? root.elementFromPoint(x, y) : null;
}
