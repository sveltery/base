// Derived from Base UI v1.9.0 packages/react/src/field/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const FieldRootDataAttributes = {
	/** Present when the field is disabled. */
	disabled: attributes.disabled,
	/** Present when the field has been touched. */
	touched: attributes.touched,
	/** Present when the field's value has changed. */
	dirty: attributes.dirty,
	/** Present when the field is valid. */
	valid: attributes.valid,
	/** Present when the field is invalid. */
	invalid: attributes.invalid,
	/** Present when the field is filled. */
	filled: attributes.filled,
	/** Present when the field control is focused. */
	focused: attributes.focused
} as const;

export const FieldLabelDataAttributes = {
	/** Present when the field is disabled. */
	disabled: attributes.disabled,
	/** Present when the field is in a valid state. */
	valid: attributes.valid,
	/** Present when the field is in an invalid state. */
	invalid: attributes.invalid,
	/** Present when the field has been touched. */
	touched: attributes.touched,
	/** Present when the field's value has changed. */
	dirty: attributes.dirty,
	/** Present when the field is filled. */
	filled: attributes.filled,
	/** Present when the field control is focused. */
	focused: attributes.focused
} as const;

export const FieldErrorDataAttributes = {
	/** Present when the field is disabled. */
	disabled: attributes.disabled,
	/** Present when the field is in a valid state. */
	valid: attributes.valid,
	/** Present when the field is in an invalid state. */
	invalid: attributes.invalid,
	/** Present when the field has been touched. */
	touched: attributes.touched,
	/** Present when the field's value has changed. */
	dirty: attributes.dirty,
	/** Present when the field is filled. */
	filled: attributes.filled,
	/** Present when the field control is focused. */
	focused: attributes.focused,
	/** Present when the error message begins animating in. */
	startingStyle: attributes.startingStyle,
	/** Present when the error message is animating out. */
	endingStyle: attributes.endingStyle
} as const;

export const FieldDescriptionDataAttributes = {
	/** Present when the field is disabled. */
	disabled: attributes.disabled,
	/** Present when the field is in a valid state. */
	valid: attributes.valid,
	/** Present when the field is in an invalid state. */
	invalid: attributes.invalid,
	/** Present when the field has been touched. */
	touched: attributes.touched,
	/** Present when the field's value has changed. */
	dirty: attributes.dirty,
	/** Present when the field is filled. */
	filled: attributes.filled,
	/** Present when the field control is focused. */
	focused: attributes.focused
} as const;

export const FieldControlDataAttributes = {
	/** Present when the field is disabled. */
	disabled: attributes.disabled,
	/** Present when the field is in a valid state. */
	valid: attributes.valid,
	/** Present when the field is in an invalid state. */
	invalid: attributes.invalid,
	/** Present when the field has been touched. */
	touched: attributes.touched,
	/** Present when the field's value has changed. */
	dirty: attributes.dirty,
	/** Present when the field is filled. */
	filled: attributes.filled,
	/** Present when the field control is focused. */
	focused: attributes.focused
} as const;

export const FieldItemDataAttributes = {
	/** Present when the field is disabled. */
	disabled: attributes.disabled,
	/** Present when the field is in a valid state. */
	valid: attributes.valid,
	/** Present when the field is in an invalid state. */
	invalid: attributes.invalid,
	/** Present when the field has been touched. */
	touched: attributes.touched,
	/** Present when the field's value has changed. */
	dirty: attributes.dirty,
	/** Present when the field is filled. */
	filled: attributes.filled,
	/** Present when the field control is focused. */
	focused: attributes.focused
} as const;
