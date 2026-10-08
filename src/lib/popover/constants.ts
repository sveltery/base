// Derived from Base UI v1.8.0 packages/react/src/popover/utils/constants.ts
// and packages/react/src/internals/constants.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export const OPEN_DELAY = 300;
export const PATIENT_CLICK_THRESHOLD = 500;

export const POPUP_COLLISION_AVOIDANCE = {
	fallbackAxisSide: 'end'
} as const;

export const COMPOSITE_KEYS = new Set([
	'ArrowDown',
	'ArrowUp',
	'ArrowRight',
	'ArrowLeft',
	'Home',
	'End'
]);
