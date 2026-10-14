// Derived from Base UI v1.9.0 packages/react/src/autocomplete/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const AutocompleteTriggerDataAttributes = {
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
	listEmpty: 'data-list-empty'
} as const;

export { ComboboxInputDataAttributes as AutocompleteInputDataAttributes } from '../combobox/data-attributes.js';

export const AutocompleteInputGroupDataAttributes = {
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
	listEmpty: 'data-list-empty'
} as const;

export { ComboboxClearDataAttributes as AutocompleteClearDataAttributes } from '../combobox/data-attributes.js';

export { ComboboxBackdropDataAttributes as AutocompleteBackdropDataAttributes } from '../combobox/data-attributes.js';

export { ComboboxPositionerCssVariables as AutocompletePositionerCssVariables } from '../combobox/data-attributes.js';

export { ComboboxPositionerDataAttributes as AutocompletePositionerDataAttributes } from '../combobox/data-attributes.js';

export { ComboboxPopupDataAttributes as AutocompletePopupDataAttributes } from '../combobox/data-attributes.js';

export { ComboboxArrowDataAttributes as AutocompleteArrowDataAttributes } from '../combobox/data-attributes.js';

export const AutocompleteItemDataAttributes = {
	/** Present when the item is highlighted. */
	highlighted: 'data-highlighted',
	/** Present when the item is disabled. */
	disabled: 'data-disabled'
} as const;

export { SeparatorDataAttributes as AutocompleteSeparatorDataAttributes } from '../separator/data-attributes.js';
