// `contains` is the small shadow-aware helper OTP Field uses on blur
// (packages/utils/src/shadowDom.ts). `stopEvent` is preventDefault plus
// stopPropagation from packages/react/src/floating-ui-react/utils/event.ts.
// ownerDocument is packages/utils/src/owner.ts.
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

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

export function stopEvent(event: Event) {
	event.preventDefault();
	event.stopPropagation();
}

export function ownerDocument(node: Element | null) {
	return node?.ownerDocument || document;
}

export function findAssociatedLabel(input: HTMLInputElement) {
	const parent = input.parentElement;
	if (parent && parent.tagName === 'LABEL') return parent as HTMLLabelElement;

	const controlId = input.id;
	if (controlId) {
		const nextSibling = input.nextElementSibling;
		if (nextSibling instanceof HTMLLabelElement && nextSibling.htmlFor === controlId) {
			return nextSibling;
		}
	}

	return input.labels?.[0];
}
