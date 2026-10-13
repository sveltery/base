// Derived from Base UI v1.9.0 packages/react/src/internals/constants.ts,
// packages/react/src/internals/reasons.ts and packages/react/src/menu/utils/isKeyboardOpen.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `@sveltery/utils` REASONS has no menu reasons yet. They live here until it does.

import { REASONS } from '@sveltery/utils';

export const MENU_REASONS = {
	...REASONS,
	triggerFocus: 'trigger-focus',
	itemPress: 'item-press',
	siblingOpen: 'sibling-open',
	cancelOpen: 'cancel-open',
	pointer: 'pointer'
} as const;

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
		(reason === MENU_REASONS.triggerPress || reason === MENU_REASONS.itemPress) &&
		(event as MouseEvent | undefined)?.detail === 0
	);
}

/** Arrow keys report `list-navigation`. Enter and Space dispatch a click with no pointer detail. */
export function isKeyboardOpen(reason: string | null, event: Event | undefined): boolean {
	return reason === MENU_REASONS.listNavigation || isKeyboardClick(reason, event);
}

/** The `onItemHighlighted` reason for a list navigation event. */
export function getHighlightReason(
	event: Event | undefined
): typeof MENU_REASONS.keyboard | typeof MENU_REASONS.pointer | typeof MENU_REASONS.none {
	if (event == null) return MENU_REASONS.none;
	if (event.type.startsWith('key')) return MENU_REASONS.keyboard;
	if (event.type.startsWith('mouse') || event.type.startsWith('pointer')) {
		return MENU_REASONS.pointer;
	}
	return MENU_REASONS.none;
}
