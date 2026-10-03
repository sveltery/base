// Base UI v1.8.0 getCheckboxStateAttributesMapping.ts. MIT.
import * as CheckboxRootDataAttributes from '../root/CheckboxRootDataAttributes.js';
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import type { CheckboxRootState } from '../types.js';
import { fieldValidityMapping } from '../../internals/field-constants/constants.js';
export function getCheckboxStateAttributesMapping(
  state: CheckboxRootState,
): StateAttributesMapping<CheckboxRootState> {
  return {
    checked(value): Record<string, string> {
      if (state.indeterminate) return {};
      return value
        ? { [CheckboxRootDataAttributes.checked]: '' }
        : { [CheckboxRootDataAttributes.unchecked]: '' };
    },
    ...fieldValidityMapping,
  };
}
