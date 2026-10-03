// Base UI v1.8.0 Switch stateAttributesMapping.ts. MIT.
import { fieldValidityMapping } from '../internals/field-constants/constants.js';
import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
import type { SwitchRootState } from './types.js';
export const stateAttributesMapping: StateAttributesMapping<SwitchRootState> = {
  ...fieldValidityMapping,
  checked(value): Record<string, string> { return value ? { 'data-checked': '' } : { 'data-unchecked': '' }; },
};
