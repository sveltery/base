// Derived from Base UI v1.9.0 packages/react/src/input/index.ts and the *DataAttributes.ts and
// *CssVars.ts files it exports (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

export const InputDataAttributes = {
	/** Present when the input is disabled. */
	disabled: 'data-disabled',
	/** Present when the input is in a valid state (when wrapped in Field.Root). */
	valid: 'data-valid',
	/** Present when the input is in an invalid state (when wrapped in Field.Root). */
	invalid: 'data-invalid',
	/** Present when the input has been touched (when wrapped in Field.Root). */
	touched: 'data-touched',
	/** Present when the input's value has changed (when wrapped in Field.Root). */
	dirty: 'data-dirty',
	/** Present when the input is filled (when wrapped in Field.Root). */
	filled: 'data-filled',
	/** Present when the input is focused (when wrapped in Field.Root). */
	focused: 'data-focused'
} as const;
