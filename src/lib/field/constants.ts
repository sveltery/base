// Derived from Base UI v1.8.0 packages/react/src/internals/field-constants/constants.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { FieldValidityData } from '../form/types.js';

/**
 * `Field.Control` treats this as an omitted `value`, so the input stays uncontrolled.
 * `Input` binds the same sentinel through. A per-instance symbol would look controlled.
 */
export const FIELD_VALUE_UNSET = Symbol('field-control-value');

export const DEFAULT_VALIDITY_STATE: FieldValidityData['state'] = {
	badInput: false,
	customError: false,
	patternMismatch: false,
	rangeOverflow: false,
	rangeUnderflow: false,
	stepMismatch: false,
	tooLong: false,
	tooShort: false,
	typeMismatch: false,
	valid: null,
	valueMissing: false
};

export const VALIDITY_KEYS = Object.keys(DEFAULT_VALIDITY_STATE) as Array<
	keyof FieldValidityData['state']
>;
