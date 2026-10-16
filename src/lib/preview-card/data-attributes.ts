// Derived from Base UI v1.9.0 packages/react/src/preview-card/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const PreviewCardTriggerDataAttributes = {
	/** Present when the corresponding preview card is open. */
	popupOpen: 'data-popup-open'
} as const;

export * as PreviewCardPositionerCssVariables from './PreviewCardPositionerCssVars.js';

export const PreviewCardPositionerDataAttributes = {
	/** Present when the preview card is open. */
	open: 'data-open',
	/** Present when the preview card is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align'
} as const;

export const PreviewCardPopupDataAttributes = {
	/** Present when the preview card is open. */
	open: 'data-open',
	/** Present when the preview card is closed. */
	closed: 'data-closed',
	/** Present when the preview card begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the preview card is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align'
} as const;

export const PreviewCardArrowDataAttributes = {
	/** Present when the preview card is open. */
	open: 'data-open',
	/** Present when the preview card is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the preview card arrow is uncentered. */
	uncentered: 'data-uncentered'
} as const;

export const PreviewCardBackdropDataAttributes = {
	/** Present when the preview card is open. */
	open: 'data-open',
	/** Present when the preview card is closed. */
	closed: 'data-closed',
	/** Present when the preview card begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the preview card is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const PreviewCardViewportCssVariables = {
	/** The width of the parent popup. This variable is placed on the 'previous' container and stores the width of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupWidth: '--popup-width',
	/** The height of the parent popup. This variable is placed on the 'previous' container and stores the height of the popup when the previous content was rendered. It can be used to freeze the dimensions of the popup when animating between different content. */
	popupHeight: '--popup-height'
} as const;

export const PreviewCardViewportDataAttributes = {
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
