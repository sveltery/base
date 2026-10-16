// Derived from Base UI v1.9.0 packages/react/src/tooltip/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const TooltipTriggerDataAttributes = {
	/** Present when the corresponding tooltip is open. */
	popupOpen: 'data-popup-open',
	/** Present when the trigger is disabled, either by the `disabled` prop or by a parent `<Tooltip.Root>` component. */
	triggerDisabled: 'data-trigger-disabled'
} as const;

export * as TooltipPositionerCssVariables from './TooltipPositionerCssVars.js';

export const TooltipPositionerDataAttributes = {
	/** Present when the tooltip is open. */
	open: 'data-open',
	/** Present when the tooltip is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align'
} as const;

export const TooltipPopupDataAttributes = {
	/** Present when the tooltip is open. */
	open: 'data-open',
	/** Present when the tooltip is closed. */
	closed: 'data-closed',
	/** Present when the tooltip begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the tooltip is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present if animations should be instant. */
	instant: 'data-instant'
} as const;

export const TooltipArrowDataAttributes = {
	/** Present when the tooltip is open. */
	open: 'data-open',
	/** Present when the tooltip is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the tooltip arrow is uncentered. */
	uncentered: 'data-uncentered',
	/** Present if animations should be instant. */
	instant: 'data-instant'
} as const;

export const TooltipViewportCssVariables = {
	/** The width of the parent popup. This variable is placed on the 'previous' container and stores the width of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupWidth: '--popup-width',
	/** The height of the parent popup. This variable is placed on the 'previous' container and stores the height of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupHeight: '--popup-height'
} as const;

export const TooltipViewportDataAttributes = {
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
