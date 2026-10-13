// Derived from Base UI v1.9.0 packages/react/src/internals/constants.ts and
// packages/react/src/menu/utils/isKeyboardOpen.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { REASONS } from '@sveltery/utils';

export const TYPEAHEAD_RESET_MS = 500;
export const PATIENT_CLICK_THRESHOLD = 500;

export const DROPDOWN_COLLISION_AVOIDANCE = { fallbackAxisSide: 'none' } as const;
export const POPUP_COLLISION_AVOIDANCE = { fallbackAxisSide: 'end' } as const;

/**
 * Keyboard and assistive-technology activations produce `detail === 0` clicks. Mouse-gesture
 * clicks, including the drag-release click an item dispatches, carry `detail >= 1`.
 */
export function isKeyboardClick(reason: string | null, event: Event | undefined): boolean {
	return (
		(reason === REASONS.triggerPress || reason === REASONS.itemPress) &&
		(event as MouseEvent | undefined)?.detail === 0
	);
}

/** Arrow keys report `list-navigation`. Enter and Space dispatch a click with no pointer detail. */
export function isKeyboardOpen(reason: string | null, event: Event | undefined): boolean {
	return reason === REASONS.listNavigation || isKeyboardClick(reason, event);
}
