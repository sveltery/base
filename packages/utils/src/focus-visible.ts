// Derived from Base UI v1.9.0 `matchesFocusVisible` in
// packages/react/src/floating-ui-react/utils/element.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { platform } from './platform.js';

/**
 * Whether `element` matches `:focus-visible`. A missing element, jsdom, and a browser without
 * the selector count as visible, so a `visibleOnly` check does not block focus.
 */
export function matchesFocusVisible(element: Element | null) {
	if (!element || platform.env.jsdom) return true;
	try {
		return element.matches(':focus-visible');
	} catch {
		return true;
	}
}
