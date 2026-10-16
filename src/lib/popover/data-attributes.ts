// Derived from Base UI v1.9.0 packages/react/src/popover/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const PopoverTriggerDataAttributes = {
	/** Present when the corresponding popover is open. */
	popupOpen: 'data-popup-open',
	/** Present when the trigger is pressed. */
	pressed: 'data-pressed',
	/** Present when the trigger is disabled. */
	disabled: attributes.disabledAttribute
} as const;

export * as PopoverPositionerCssVariables from './PopoverPositionerCssVars.js';

export const PopoverPositionerDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: attributes.sideAttribute,
	/** Indicates how the popup is aligned relative to specified side. */
	align: attributes.alignAttribute
} as const;

export const PopoverPopupCssVariables = {
	/** The width of the popup. */
	popupWidth: '--popup-width',
	/** The height of the popup. */
	popupHeight: '--popup-height'
} as const;

export const PopoverPopupDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the popup begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the popup is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: attributes.sideAttribute,
	/** Indicates how the popup is aligned relative to specified side. */
	align: attributes.alignAttribute,
	/** Present if animations should be instant. */
	instant: attributes.instantAttribute
} as const;

export const PopoverArrowDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: attributes.sideAttribute,
	/** Indicates how the popup is aligned relative to specified side. */
	align: attributes.alignAttribute,
	/** Present when the popover arrow is uncentered. */
	uncentered: attributes.uncenteredAttribute
} as const;

export const PopoverBackdropDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the popup begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the popup is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const PopoverViewportCssVariables = {
	/** The width of the parent popup. This variable is placed on the 'previous' container and stores the width of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupWidth: '--popup-width',
	/** The height of the parent popup. This variable is placed on the 'previous' container and stores the height of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupHeight: '--popup-height'
} as const;

export const PopoverViewportDataAttributes = {
	/** Applied to the direct child of the viewport when no transitions are present or the new content when it's entering. */
	current: 'data-current',
	/** Applied to the direct child of the viewport that contains the exiting content when transitions are present. */
	previous: 'data-previous',
	/** Indicates the direction from which the popup was activated. This can be used to create directional animations based on how the popup was triggered. Contains space-separated values for both horizontal and vertical axes. */
	activationDirection: attributes.activationDirectionAttribute,
	/** Indicates that the viewport is currently transitioning between old and new content. */
	transitioning: attributes.transitioningAttribute,
	/** Present if animations should be instant. */
	instant: attributes.instantAttribute
} as const;
