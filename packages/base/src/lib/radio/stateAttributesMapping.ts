// Base UI v1.8.0 radio/utils/stateAttributesMapping; MIT.
import { transitionStatusMapping } from '../internals/stateAttributesMapping.js';
import { fieldValidityMapping } from '../internals/field-constants/constants.js';
export const stateAttributesMapping = {
  checked(value: boolean): Record<string, string> {
    return value ? { 'data-checked': '' } : { 'data-unchecked': '' };
  },
  ...transitionStatusMapping,
  ...fieldValidityMapping,
};
