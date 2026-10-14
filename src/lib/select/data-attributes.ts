// Derived from Base UI v1.9.0 packages/react/src/select/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const SelectTriggerDataAttributes = {
	/** Present when the corresponding select is open. */
	popupOpen: 'data-popup-open',
	/** Present when the trigger is pressed. */
	pressed: 'data-pressed',
	/** Present when the select is disabled. */
	disabled: 'data-disabled',
	/** Present when the select is readonly. */
	readonly: 'data-readonly',
	/** Indicates which side the corresponding popup is positioned relative to its anchor. */
	popupSide: 'data-popup-side',
	/** Present when the select is required. */
	required: 'data-required',
	/** Present when the select is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the select is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the select has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the select's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when the select has a value (when wrapped in Field.Root). */
	filled: 'data-filled',
	/** Present when the select trigger is focused (when wrapped in Field.Root). */
	focused: 'data-focused',
	/** Present when the select doesn't have a value. */
	placeholder: 'data-placeholder'
} as const;

export const SelectValueDataAttributes = {
	/** Present when the select doesn't have a value. */
	placeholder: 'data-placeholder'
} as const;

export const SelectIconDataAttributes = {
	/** Present when the corresponding popup is open. */
	popupOpen: 'data-popup-open'
} as const;

export const SelectBackdropDataAttributes = {
	/** Present when the select is open. */
	open: 'data-open',
	/** Present when the select is closed. */
	closed: 'data-closed',
	/** Present when the select begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the select is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const SelectPositionerCssVariables = {
	/** The available width between the trigger and the edge of the viewport. */
	availableWidth: '--available-width',
	/** The available height between the trigger and the edge of the viewport. */
	availableHeight: '--available-height',
	/** The anchor's width. */
	anchorWidth: '--anchor-width',
	/** The anchor's height. */
	anchorHeight: '--anchor-height',
	/** The coordinates that this element is anchored to. Used for animations and transitions. */
	transformOrigin: '--transform-origin'
} as const;

export const SelectPositionerDataAttributes = {
	/** Present when the select popup is open. */
	open: 'data-open',
	/** Present when the select popup is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align'
} as const;

export const SelectPopupDataAttributes = {
	/** Present when the select is open. */
	open: 'data-open',
	/** Present when the select is closed. */
	closed: 'data-closed',
	/** Present when the select begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the select is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align'
} as const;

export const SelectItemDataAttributes = {
	/** Present when the select item is selected. */
	selected: 'data-selected',
	/** Present when the select item is highlighted. */
	highlighted: 'data-highlighted',
	/** Present when the select item is disabled. */
	disabled: 'data-disabled'
} as const;

export const SelectItemIndicatorDataAttributes = {
	/** Present when the indicator begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the indicator is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const SelectArrowDataAttributes = {
	/** Present when the select popup is open. */
	open: 'data-open',
	/** Present when the select popup is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the select arrow is uncentered. */
	uncentered: 'data-uncentered'
} as const;

export const SelectScrollDownArrowDataAttributes = {
	/** Present when the scroll arrow begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the scroll arrow is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates the direction of the scroll arrow. */
	direction: 'data-direction',
	/** Present when the scroll arrow is visible. */
	visible: 'data-visible',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side'
} as const;

export const SelectScrollUpArrowDataAttributes = {
	/** Present when the scroll arrow begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the scroll arrow is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates the direction of the scroll arrow. */
	direction: 'data-direction',
	/** Present when the scroll arrow is visible. */
	visible: 'data-visible',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side'
} as const;

export { SeparatorDataAttributes as SelectSeparatorDataAttributes } from '../separator/data-attributes.js';
