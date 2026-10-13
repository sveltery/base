// Derived from Base UI v1.9.0 packages/react/src/otp-field/utils/stateAttributesMapping.ts
// and the OTP field *DataAttributes.ts modules
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { fieldValidityMapping } from '../field/attributes.js';
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { OTPFieldInputState, OTPFieldRootState } from './types.js';

export const complete = 'data-complete';
export const disabled = 'data-disabled';
export const readOnly = 'data-readonly';
export const required = 'data-required';
export const filled = 'data-filled';
export const focused = 'data-focused';

export const rootStateAttributes: StateAttributesMapping<OTPFieldRootState> = {
	value: () => null,
	length: () => null,
	...fieldValidityMapping
};

export const inputStateAttributes: StateAttributesMapping<OTPFieldInputState> = {
	value: () => null,
	index: () => null,
	// Upstream keeps this, so its slots render `data-length`. Its documented slot attributes omit it.
	length: () => null,
	...fieldValidityMapping
};
