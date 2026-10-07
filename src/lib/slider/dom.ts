// Derived from Base UI v1.8.0 packages/utils/src/owner.ts,
// packages/utils/src/addEventListener.ts, and the floating-ui DOM helpers Slider calls
// (`isElement`, `activeElement`, `contains`, `getTarget`, `matchesFocusVisible`).
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function isElement(value: EventTarget | null | undefined): value is Element {
	return value instanceof Element;
}

export function activeElement(doc: Document) {
	let element = doc.activeElement;
	while (element?.shadowRoot?.activeElement != null) {
		element = element.shadowRoot.activeElement;
	}
	return element;
}

export function getTarget(event: Event) {
	if (typeof event.composedPath === 'function') {
		const path = event.composedPath();
		if (path.length > 0) return path[0];
	}
	return event.target;
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

export function matchesFocusVisible(element: Element) {
	try {
		return element.matches(':focus-visible');
	} catch {
		return false;
	}
}

export function ownerDocument(node: Node | null | undefined): Document {
	return node?.ownerDocument ?? document;
}

export function ownerWindow(node: Node | null | undefined): Window & typeof globalThis {
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

export function focusElement(
	element: HTMLElement,
	options: { preventScroll?: boolean; focusVisible?: boolean }
) {
	element.focus(options as FocusOptions);
}
