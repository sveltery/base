// Base UI v1.8.0 field constants and custom mapping; MIT: THIRD_PARTY_NOTICES.md.
import type { FieldRootState, FieldValidityData } from './types.js';
export const DEFAULT_VALIDITY_STATE: FieldValidityData['state'] = {
  badInput: false, customError: false, patternMismatch: false, rangeOverflow: false, rangeUnderflow: false,
  stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false, valid: null, valueMissing: false,
};
export const DEFAULT_FIELD_STATE: FieldRootState = {
  disabled: false, touched: false, dirty: false, filled: false, focused: false, valid: null,
};
export function stateAttributes(value: FieldRootState): Record<string, unknown> {
  return {
    'data-disabled': value.disabled ? '' : undefined, 'data-touched': value.touched ? '' : undefined,
    'data-dirty': value.dirty ? '' : undefined, 'data-filled': value.filled ? '' : undefined,
    'data-focused': value.focused ? '' : undefined,
    'data-valid': value.valid === true ? '' : undefined, 'data-invalid': value.valid === false ? '' : undefined,
  };
}
