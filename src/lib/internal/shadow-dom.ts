// Derived from Base UI v1.8.0 packages/utils/src/shadowDom.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `contains` also accepts a non-element event target and returns false, which is the
// guard Slider and OTP Field already used before this helper existed.

export function activeElement(doc: Document) {
	let element = doc.activeElement;
	while (element?.shadowRoot?.activeElement != null) {
		element = element.shadowRoot.activeElement;
	}
	return element;
}

export function contains(
	parent: Element | null | undefined,
	child: EventTarget | Node | null | undefined
) {
	if (!parent || !child || !(child instanceof Node)) return false;
	if (parent.contains(child)) return true;

	let node: Node | null = child;
	while (node) {
		if (node === parent) return true;
		const root = node.getRootNode();
		if (root instanceof ShadowRoot) node = root.host;
		else break;
	}
	return false;
}

export function getTarget(event: Event): EventTarget | null {
	if (typeof event.composedPath === 'function') {
		return event.composedPath()[0] ?? event.target;
	}
	return event.target;
}
