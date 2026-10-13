// Derived from Base UI v1.9.0 packages/react/src/internals/reasons.ts,
// packages/react/src/internals/constants.ts and packages/react/src/select/trigger/SelectTrigger.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `@sveltery/utils` REASONS has no item-press, cancel-open or window-resize reason yet.

export const ITEM_PRESS = 'item-press';
export const CANCEL_OPEN = 'cancel-open';
export const WINDOW_RESIZE = 'window-resize';

/** How long mouseup selection stays off after the popup opens under the cursor. */
export const SELECTED_DELAY = 400;

export const DROPDOWN_COLLISION_AVOIDANCE = {
	fallbackAxisSide: 'none'
} as const;
