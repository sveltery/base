// Derived from Base UI v1.9.0 packages/react/src/menu/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const MenuArrowDataAttributes = {
	/** Present when the menu popup is open. */
	open: 'data-open',
	/** Present when the menu popup is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the anchor. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the menu arrow is uncentered. */
	uncentered: 'data-uncentered'
} as const;

export const MenuBackdropDataAttributes = {
	/** Present when the menu is open. */
	open: 'data-open',
	/** Present when the menu is closed. */
	closed: 'data-closed',
	/** Present when the menu begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the menu is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const MenuCheckboxItemDataAttributes = {
	/** Present when the menu checkbox item is checked. */
	checked: 'data-checked',
	/** Present when the menu checkbox item is not checked. */
	unchecked: 'data-unchecked',
	/** Present when the menu checkbox item is disabled. */
	disabled: 'data-disabled',
	/** Present when the menu checkbox item is highlighted. */
	highlighted: 'data-highlighted'
} as const;

export const MenuCheckboxItemIndicatorDataAttributes = {
	/** Present when the menu checkbox item is checked. */
	checked: 'data-checked',
	/** Present when the menu checkbox item is not checked. */
	unchecked: 'data-unchecked',
	/** Present when the menu checkbox item is disabled. */
	disabled: 'data-disabled',
	/** Present when the indicator begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the indicator is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const MenuItemDataAttributes = {
	/** Present when the menu item is highlighted. */
	highlighted: 'data-highlighted',
	/** Present when the menu item is disabled. */
	disabled: 'data-disabled'
} as const;

export const MenuLinkItemDataAttributes = {
	/** Present when the link is highlighted. */
	highlighted: 'data-highlighted'
} as const;

export const MenuPopupDataAttributes = {
	/** Present when the menu is open. */
	open: 'data-open',
	/** Present when the menu is closed. */
	closed: 'data-closed',
	/** Present when the menu begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the menu is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates which side the popup is positioned relative to the anchor. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present if animations should be instant. */
	instant: 'data-instant'
} as const;

export * as MenuPositionerCssVariables from '../internal/CommonPositionerCssVars.js';

export const MenuPositionerDataAttributes = {
	/** Present when the menu popup is open. */
	open: 'data-open',
	/** Present when the menu popup is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the anchor. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to the specified side. */
	align: 'data-align'
} as const;

export const MenuRadioItemDataAttributes = {
	/** Present when the menu radio item is selected. */
	checked: 'data-checked',
	/** Present when the menu radio item is not selected. */
	unchecked: 'data-unchecked',
	/** Present when the menu radio item is disabled. */
	disabled: 'data-disabled',
	/** Present when the menu radio item is highlighted. */
	highlighted: 'data-highlighted'
} as const;

export const MenuRadioItemIndicatorDataAttributes = {
	/** Present when the menu radio item is selected. */
	checked: 'data-checked',
	/** Present when the menu radio item is not selected. */
	unchecked: 'data-unchecked',
	/** Present when the menu radio item is disabled. */
	disabled: 'data-disabled',
	/** Present when the radio indicator begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the radio indicator is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const MenuTriggerDataAttributes = {
	/** Present when the corresponding menu is open. */
	popupOpen: 'data-popup-open',
	/** Present when the trigger is pressed. */
	pressed: 'data-pressed',
	/** Present when the trigger is disabled. */
	disabled: 'data-disabled'
} as const;

export const MenuViewportCssVariables = {
	/** The width of the parent popup. This variable is placed on the 'previous' container and stores the width of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupWidth: '--popup-width',
	/** The height of the parent popup. This variable is placed on the 'previous' container and stores the height of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupHeight: '--popup-height'
} as const;

export const MenuViewportDataAttributes = {
	/** Applied to the direct child of the viewport when no transitions are present or the new content when it's entering. */
	current: 'data-current',
	/** Applied to the direct child of the viewport that contains the exiting content when transitions are present. */
	previous: 'data-previous',
	/** Indicates the direction from which the popup was activated. This can be used to create directional animations based on how the popup was triggered. Contains space-separated values for both horizontal and vertical axes. */
	activationDirection: 'data-activation-direction',
	/** Indicates that the viewport is currently transitioning between old and new content. */
	transitioning: 'data-transitioning',
	/** Present if animations should be instant. */
	instant: 'data-instant'
} as const;

export { SeparatorDataAttributes as MenuSeparatorDataAttributes } from '../separator/data-attributes.js';

export const MenuSubmenuTriggerDataAttributes = {
	/** Present when the corresponding submenu is open. */
	popupOpen: 'data-popup-open',
	/** Present when the submenu trigger is highlighted. */
	highlighted: 'data-highlighted',
	/** Present when the submenu trigger is disabled. */
	disabled: 'data-disabled'
} as const;

export const MenuInputDataAttributes = {
	/** Present while the input shows its focus ring. Cleared when keyboard navigation highlights an item. */
	highlighted: 'data-highlighted'
} as const;

export const MenuClearDataAttributes = {
	/** Present when the button is disabled. */
	disabled: 'data-disabled'
} as const;
