// Derived from Base UI v1.8.0 packages/react/src/otp-field/utils/stateAttributesMapping.ts
// and the OTP field *DataAttributes.ts modules
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

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
	...fieldValidityMapping
};
