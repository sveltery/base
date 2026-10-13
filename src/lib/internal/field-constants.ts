// Derived from Base UI v1.9.0 packages/react/src/internals/field-constants/constants.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { FieldValidityData } from '../form/types.js';

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
