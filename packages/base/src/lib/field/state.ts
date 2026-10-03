// Base UI v1.8.0 field constants and custom mapping; MIT: THIRD_PARTY_NOTICES.md.
import type { FieldRootState } from './types.js';
export { DEFAULT_VALIDITY_STATE, DEFAULT_FIELD_ROOT_STATE as DEFAULT_FIELD_STATE } from '../internals/field-constants/constants.js';
export function stateAttributes(value: FieldRootState): Record<string, unknown> {
  return {
    'data-disabled': value.disabled ? '' : undefined, 'data-touched': value.touched ? '' : undefined,
    'data-dirty': value.dirty ? '' : undefined, 'data-filled': value.filled ? '' : undefined,
    'data-focused': value.focused ? '' : undefined,
    'data-valid': value.valid === true ? '' : undefined, 'data-invalid': value.valid === false ? '' : undefined,
  };
}
