// The menu's own inline styles, set one property at a time.

import type { Attachment } from 'svelte/attachments';
import { toCssStyle } from '../internal/css-style.js';

type Styles = Record<string, string | number | undefined | null>;

/**
 * Sets each declaration with `setProperty`. A `style` attribute string replaces every inline
 * style when it changes, which drops the `pointer-events` the safe polygon sets on the popup.
 * The attachment re-runs when `readStyleAttribute` changes and compares each declaration with
 * the element's current value, so a rewritten attribute gets the declarations back.
 */
export function liveStyle(
	read: () => Styles,
	readStyleAttribute: () => unknown
): Attachment<HTMLElement> {
	const applied = new WeakMap<HTMLElement, Set<string>>();
	return (node) => {
		readStyleAttribute();
		const next = new Map<string, string>();
		const text = toCssStyle(read());
		for (const declaration of text ? text.split('; ') : []) {
			const colon = declaration.indexOf(': ');
			next.set(declaration.slice(0, colon), declaration.slice(colon + 2));
		}
		for (const property of applied.get(node) ?? []) {
			if (!next.has(property)) node.style.removeProperty(property);
		}
		for (const [property, value] of next) {
			if (node.style.getPropertyValue(property) !== value) node.style.setProperty(property, value);
		}
		applied.set(node, new Set(next.keys()));
	};
}
