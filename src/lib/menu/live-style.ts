// The menu's own inline styles, set one property at a time.

import type { Attachment } from 'svelte/attachments';
import { toCssStyle } from '../internal/css-style.js';

type Styles = Record<string, string | number | undefined | null>;

/**
 * Sets each declaration with `setProperty`. A `style` attribute string replaces every inline
 * style when it changes, which drops the `pointer-events` the safe polygon sets on the popup.
 */
export function liveStyle(read: () => Styles): Attachment<HTMLElement> {
	const applied = new WeakMap<HTMLElement, Map<string, string>>();
	return (node) => {
		const previous = applied.get(node) ?? new Map<string, string>();
		const next = new Map<string, string>();
		const text = toCssStyle(read());
		for (const declaration of text ? text.split('; ') : []) {
			const colon = declaration.indexOf(': ');
			next.set(declaration.slice(0, colon), declaration.slice(colon + 2));
		}
		for (const property of previous.keys()) {
			if (!next.has(property)) node.style.removeProperty(property);
		}
		for (const [property, value] of next) {
			if (previous.get(property) !== value) node.style.setProperty(property, value);
		}
		applied.set(node, next);
	};
}
