// Resolves Popover initialFocus and finalFocus.
// Touch focuses the popup so a virtual keyboard does not open.
// Derived from createDefaultInitialFocus in packages/react/src/utils/popups/popupStoreUtils.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { FocusTarget, InteractionType } from './types.js';

export function resolveFocus(
	spec: FocusTarget | undefined,
	interaction: InteractionType | '' | null,
	popup: HTMLElement | null
): boolean | HTMLElement {
	const kind = interaction || '';
	if (spec === undefined) {
		if (kind === 'touch') return popup ?? false;
		return true;
	}
	if (typeof spec === 'function') {
		const result = spec(kind);
		if (result instanceof HTMLElement) return result;
		if (result === false || result === undefined) return false;
		return true;
	}
	if (spec instanceof HTMLElement) return spec;
	if (spec === false) return false;
	return true;
}
