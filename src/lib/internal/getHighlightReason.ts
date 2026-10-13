// Derived from Base UI v1.9.0 packages/react/src/utils/getHighlightReason.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { REASONS } from '@sveltery/utils';

/** The `onItemHighlighted` reason for a list navigation event. */
export function getHighlightReason(
	event: Event | undefined
): typeof REASONS.keyboard | typeof REASONS.pointer | typeof REASONS.none {
	if (event == null) return REASONS.none;
	if (event.type.startsWith('key')) return REASONS.keyboard;
	if (event.type.startsWith('mouse') || event.type.startsWith('pointer')) return REASONS.pointer;
	return REASONS.none;
}
