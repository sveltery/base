// Derived from Base UI v1.9.0 packages/utils/src/shadowDom.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `contains` and `closest` also accept a non-node event target and return false or null,
// which is the guard Slider and OTP Field already used before these helpers existed.

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

	let root = child.getRootNode();
	while (root instanceof ShadowRoot) {
		if (parent.contains(root.host)) return true;
		root = root.host.getRootNode();
	}
	return false;
}

/**
 * The closest matching element in the composed tree, crossing slots and shadow roots.
 * `:scope` is not supported.
 */
export function closest(
	node: EventTarget | Node | null | undefined,
	selector: string
): Element | null {
	let current = node instanceof Node ? node : null;
	while (current) {
		if (current instanceof Element && current.matches(selector)) return current;
		current =
			(current as Element).assignedSlot ??
			current.parentNode ??
			(current instanceof ShadowRoot ? current.host : null);
	}
	return null;
}

export function getTarget(event: Event): EventTarget | null {
	if (typeof event.composedPath === 'function') {
		return event.composedPath()[0] ?? event.target;
	}
	return event.target;
}
