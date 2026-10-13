// Derived from Base UI v1.9.0 packages/react/src/navigation-menu/utils/constants.ts,
// packages/react/src/navigation-menu/popup/NavigationMenuPopupCssVars.ts,
// packages/react/src/navigation-menu/positioner/NavigationMenuPositionerCssVars.ts,
// and packages/react/src/internals/constants.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export const OPEN_DELAY = 50;
export const CLOSE_DELAY = 50;
export const PATIENT_CLICK_THRESHOLD = 500;
export const NAVIGATION_MENU_TRIGGER_IDENTIFIER = 'data-base-ui-navigation-menu-trigger';

export const POPUP_WIDTH_VAR = '--popup-width';
export const POPUP_HEIGHT_VAR = '--popup-height';
export const POSITIONER_WIDTH_VAR = '--positioner-width';
export const POSITIONER_HEIGHT_VAR = '--positioner-height';

export const DROPDOWN_COLLISION_AVOIDANCE = { fallbackAxisSide: 'none' } as const;
export const POPUP_COLLISION_AVOIDANCE = { fallbackAxisSide: 'end' } as const;

/** Upstream `ownerVisuallyHidden`: the empty `aria-owns` span needs no other hiding. */
export const OWNER_VISUALLY_HIDDEN_STYLE =
	'clip-path: inset(50%); position: fixed; top: 0px; left: 0px';
