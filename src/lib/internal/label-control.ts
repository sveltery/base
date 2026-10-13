// Derived from Base UI v1.9.0
// packages/react/src/internals/labelable-provider/useLabel.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { ownerDocument } from '@sveltery/utils';

/** The labelled control, searched from the label's shadow root outward to its document. */
export function getControlById(label: Element, id: string): Element | null {
	let root = label.getRootNode();
	while (root instanceof ShadowRoot) {
		const element = root.getElementById(id);
		if (element) return element;
		root = root.host.getRootNode();
	}
	return ownerDocument(label).getElementById(id);
}
