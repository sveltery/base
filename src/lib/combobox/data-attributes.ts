// Derived from Base UI v1.9.0 packages/react/src/combobox/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const ComboboxInputDataAttributes = {
	/** Present when the corresponding popup is open. */
	popupOpen: 'data-popup-open',
	/** Present when the input is pressed. */
	pressed: 'data-pressed',
	/** Present when the component is disabled. */
	disabled: 'data-disabled',
	/** Present when the component is readonly. */
	readonly: 'data-readonly',
	/** Indicates which side the corresponding popup is positioned relative to its anchor. */
	popupSide: 'data-popup-side',
	/** Present when the component is required. */
	required: 'data-required',
	/** Present when the component is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the component is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the component has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the component's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when the component has a value (when wrapped in Field.Root). */
	filled: 'data-filled',
	/** Present when the input is focused (when wrapped in Field.Root). */
	focused: 'data-focused',
	/** Present when the corresponding items list is empty. */
	listEmpty: 'data-list-empty'
} as const;

export const ComboboxInputGroupDataAttributes = {
	/** Present when the corresponding popup is open. */
	popupOpen: 'data-popup-open',
	/** Present when the input group is pressed. */
	pressed: 'data-pressed',
	/** Present when the component is disabled. */
	disabled: 'data-disabled',
	/** Present when the component is readonly. */
	readonly: 'data-readonly',
	/** Indicates which side the corresponding popup is positioned relative to its anchor. */
	popupSide: 'data-popup-side',
	/** Present when the component is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the component is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the component has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the component's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when the component has a value (when wrapped in Field.Root). */
	filled: 'data-filled',
	/** Present when the component is focused (when wrapped in Field.Root). */
	focused: 'data-focused',
	/** Present when the corresponding items list is empty. */
	listEmpty: 'data-list-empty',
	/** Present when the combobox doesn't have a value. */
	placeholder: 'data-placeholder'
} as const;

export const ComboboxTriggerDataAttributes = {
	/** Present when the corresponding popup is open. */
	popupOpen: 'data-popup-open',
	/** Present when the trigger is pressed. */
	pressed: 'data-pressed',
	/** Present when the component is disabled. */
	disabled: 'data-disabled',
	/** Present when the component is readonly. */
	readonly: 'data-readonly',
	/** Indicates which side the corresponding popup is positioned relative to its anchor. */
	popupSide: 'data-popup-side',
	/** Present when the component is required. */
	required: 'data-required',
	/** Present when the component is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the component is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the component has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the component's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when the component has a value (when wrapped in Field.Root). */
	filled: 'data-filled',
	/** Present when the trigger is focused (when wrapped in Field.Root). */
	focused: 'data-focused',
	/** Present when the corresponding items list is empty. */
	listEmpty: 'data-list-empty',
	/** Present when the combobox doesn't have a value. */
	placeholder: 'data-placeholder'
} as const;

export const ComboboxBackdropDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the popup begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the popup is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const ComboboxPositionerCssVariables = {
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

export const ComboboxPositionerDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the items list is empty. */
	empty: 'data-empty'
} as const;

export const ComboboxPopupDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Present when the popup begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the popup is animating out. */
	endingStyle: 'data-ending-style',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the anchor is hidden. */
	anchorHidden: 'data-anchor-hidden',
	/** Present when the items list is empty. */
	empty: 'data-empty'
} as const;

export const ComboboxArrowDataAttributes = {
	/** Present when the popup is open. */
	open: 'data-open',
	/** Present when the popup is closed. */
	closed: 'data-closed',
	/** Indicates which side the popup is positioned relative to the trigger. */
	side: 'data-side',
	/** Indicates how the popup is aligned relative to specified side. */
	align: 'data-align',
	/** Present when the arrow is uncentered. */
	uncentered: 'data-uncentered'
} as const;

export const ComboboxItemDataAttributes = {
	/** Present when the item is selected. */
	selected: 'data-selected',
	/** Present when the item is highlighted. */
	highlighted: 'data-highlighted',
	/** Present when the item is disabled. */
	disabled: 'data-disabled'
} as const;

export const ComboboxItemIndicatorDataAttributes = {
	/** Present when the indicator begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the indicator is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export const ComboboxClearDataAttributes = {
	/** Present when the corresponding popup is open. */
	popupOpen: 'data-popup-open',
	/** Present when the button is disabled. */
	disabled: 'data-disabled',
	/** Present when the clear button is visible. */
	visible: 'data-visible',
	/** Present when the button begins animating in. */
	startingStyle: 'data-starting-style',
	/** Present when the button is animating out. */
	endingStyle: 'data-ending-style'
} as const;

export { SeparatorDataAttributes as ComboboxSeparatorDataAttributes } from '../separator/data-attributes.js';
