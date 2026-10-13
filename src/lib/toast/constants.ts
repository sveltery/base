// Derived from Base UI v1.9.0 packages/react/src/toast/**/*DataAttributes.ts and *CssVars.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream exports each file as a namespace. These objects read the same way:
// `ToastRootDataAttributes.swipeDirection`.

export const ToastViewportCssVariables = {
	/** Indicates the height of the frontmost toast. */
	frontmostHeight: '--toast-frontmost-height'
} as const;

export const ToastViewportDataAttributes = {
	/** Indicates toasts are expanded in the viewport. */
	expanded: 'data-expanded'
} as const;

export const ToastRootCssVariables = {
	/** Indicates the index of the toast in the list. */
	index: '--toast-index',
	/** Indicates the vertical pixels offset of the toast in the list when expanded. */
	offsetY: '--toast-offset-y',
	/** Indicates the measured natural height of the toast in pixels. */
	height: '--toast-height',
	/** Indicates the horizontal swipe movement of the toast. */
	swipeMovementX: '--toast-swipe-movement-x',
	/** Indicates the vertical swipe movement of the toast. */
	swipeMovementY: '--toast-swipe-movement-y'
} as const;

export const ToastRootDataAttributes = {
	/** Present when the toast is expanded in the viewport. */
	expanded: 'data-expanded',
	/** Present when the toast was limited because the toast limit was exceeded. */
	limited: 'data-limited',
	/** The type of the toast. */
	type: 'data-type',
	/** Present when the toast is being swiped. */
	swiping: 'data-swiping',
	/** The direction the toast was swiped. */
	swipeDirection: 'data-swipe-direction',
	/** Present when the toast begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the toast is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const ToastContentDataAttributes = {
	/** Present when the toast viewport is expanded. */
	expanded: 'data-expanded',
	/** Present when the toast is behind the frontmost toast in the stack. */
	behind: 'data-behind'
} as const;

export const ToastTitleDataAttributes = {
	/** The type of the toast. */
	type: 'data-type'
} as const;

export const ToastDescriptionDataAttributes = {
	/** The type of the toast. */
	type: 'data-type'
} as const;

export const ToastCloseDataAttributes = {
	/** The type of the toast. */
	type: 'data-type'
} as const;

export const ToastActionDataAttributes = {
	/** The type of the toast. */
	type: 'data-type'
} as const;

export const ToastPositionerCssVariables = {
	/** The available width between the anchor and the edge of the viewport. */
	availableWidth: '--available-width',
	/** The available height between the anchor and the edge of the viewport. */
	availableHeight: '--available-height',
	/** The anchor's width. */
	anchorWidth: '--anchor-width',
	/** The anchor's height. */
	anchorHeight: '--anchor-height',
	/** The coordinates that this element is anchored to. Used for animations and transitions. */
	transformOrigin: '--transform-origin'
} as const;

export const ToastPositionerDataAttributes = {
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the toast is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the toast is aligned relative to specified side. */
	align: 'data-align'
} as const;

export const ToastArrowDataAttributes = {
	/** Indicates which side the toast is positioned relative to the anchor. */
	side: 'data-side',
	/** Indicates how the toast is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the toast arrow is uncentered. */
	uncentered: 'data-uncentered'
} as const;
