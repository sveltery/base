// Derived from Base UI v1.9.0 packages/react/src/navigation-menu/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const NavigationMenuContentDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the content begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the content is animating out. */
	endingStyle: 'data-ending-style',
	/** Which direction another trigger was activated from. */
	activationDirection: 'data-activation-direction'
} as const;

export const NavigationMenuTriggerDataAttributes = {
	/** Present when the corresponding navigation menu is open. */
	popupOpen: 'data-popup-open',
	/** Present when the trigger is pressed. */
	pressed: 'data-pressed',
	/** Present when the trigger is disabled. */
	disabled: 'data-disabled'
} as const;

export * as NavigationMenuPositionerCssVariables from './NavigationMenuPositionerCssVars.js';

export const NavigationMenuPositionerDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to the specified side. */
	align: 'data-align',
	/** Present if animations should be instant. */
	instant: 'data-instant'
} as const;

export const NavigationMenuBackdropDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the popup begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the popup is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const NavigationMenuPopupCssVariables = {
	/** The fixed width of the popup element. */
	popupWidth: '--popup-width',
	/** The fixed height of the popup element. */
	popupHeight: '--popup-height'
} as const;

export const NavigationMenuPopupDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the popup begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the popup is animating out. */
	endingStyle: 'data-ending-style',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to the specified side. */
	align: 'data-align'
} as const;

export const NavigationMenuArrowDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the popup arrow is uncentered. */
	uncentered: 'data-uncentered'
} as const;

export const NavigationMenuLinkDataAttributes = {
	/** Present when the link is the currently active page. */
	active: 'data-active'
} as const;

export const NavigationMenuIconDataAttributes = {
	/** Present when the navigation menu is open and the item is active. */
	popupOpen: 'data-popup-open'
} as const;
