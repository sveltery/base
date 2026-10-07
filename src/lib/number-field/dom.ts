// Derived from Base UI v1.8.0 packages/utils/src/shadowDom.ts,
// packages/utils/src/owner.ts, and packages/utils/src/addEventListener.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `activeElement` and `getTarget` are the two helpers NumberField uses. The rest of
// the floating-ui shadow-dom module is not part of this component.

export function activeElement(doc: Document) {
	let element = doc.activeElement;
	while (element?.shadowRoot?.activeElement != null) {
		element = element.shadowRoot.activeElement;
	}
	return element;
}

export function getTarget(event: Event) {
	return event.composedPath()[0] ?? event.target;
}

export function ownerDocument(node: Node | null | undefined): Document {
	return node?.ownerDocument ?? document;
}

export function ownerWindow(node: Node | null | undefined): Window {
	const view = ownerDocument(node).defaultView;
	return view ?? window;
}

export function addEventListener(
	target: EventTarget,
	type: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions
) {
	target.addEventListener(type, listener, options);
	return () => {
		target.removeEventListener(type, listener, options);
	};
}
