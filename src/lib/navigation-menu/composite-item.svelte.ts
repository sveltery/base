// Registration of a trigger or link with the composite list around it.
// Derived from Base UI v1.9.0 packages/react/src/internals/composite/item/useCompositeItem.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Navigation menu items keep their own `tabindex`, so only registration and the
// highlight on focus are used. The arrow keys are handled by the list or the content.

import type { CompositeRoot } from '../internal/composite-root.svelte.js';

export function compositeItem(composite: CompositeRoot | null) {
	return {
		attach: (node: HTMLElement) => composite?.register(node),
		onfocus: (event: FocusEvent) => {
			if (event.currentTarget instanceof HTMLElement) composite?.highlight(event.currentTarget);
		}
	};
}
