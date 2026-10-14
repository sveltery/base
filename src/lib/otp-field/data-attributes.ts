// Derived from Base UI v1.9.0 packages/react/src/otp-field/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import * as attributes from './attributes.js';

export const OTPFieldRootDataAttributes = {
	/** Present when all slots are filled. */
	complete: attributes.complete,
	/** Present when the OTP field is disabled. */
	disabled: attributes.disabled,
	/** Present when the OTP field is readonly. */
	readonly: attributes.readOnly,
	/** Present when the OTP field is required. */
	required: attributes.required,
	/** Present when the OTP field is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the OTP field is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the OTP field has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the OTP field's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when the OTP field contains at least one character. */
	filled: attributes.filled,
	/** Present when one of the OTP field inputs is focused. */
	focused: attributes.focused
} as const;

export const OTPFieldInputDataAttributes = {
	/** Present when all slots are filled. */
	complete: attributes.complete,
	/** Present when the input contains a character. */
	filled: attributes.filled,
	/** Present when the OTP field is disabled. */
	disabled: attributes.disabled,
	/** Present when the OTP field is readonly. */
	readonly: attributes.readOnly,
	/** Present when the OTP field is required. */
	required: attributes.required,
	/** Present when the OTP field is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the OTP field is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the OTP field has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the OTP field's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when any OTP field input is focused. */
	focused: attributes.focused
} as const;

export { SeparatorDataAttributes as OTPFieldSeparatorDataAttributes } from '../separator/data-attributes.js';
