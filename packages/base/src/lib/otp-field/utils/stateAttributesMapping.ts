// Ported from Base UI v1.8.0; MIT: THIRD_PARTY_NOTICES.md.
import { fieldValidityMapping } from '../../internals/field-constants/constants.js';
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import type { OTPFieldRootState } from '../types.js';
import type { OTPFieldInputState } from '../types.js';

export const rootStateAttributesMapping: StateAttributesMapping<OTPFieldRootState> = {
  value: () => null,
  length: () => null,
  ...fieldValidityMapping,
};

export const inputStateAttributesMapping: StateAttributesMapping<OTPFieldInputState> = {
  value: () => null,
  index: () => null,
  ...fieldValidityMapping,
};
