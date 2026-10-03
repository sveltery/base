// Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Source function body is unchanged.
import type { FieldValidityData } from '../types.js';

/**
 * Combines the field's client-side, stateful validity data with the external invalid state to
 * determine the field's true validity.
 */
export function getCombinedFieldValidityData(
  validityData: FieldValidityData,
  invalid: boolean | undefined,
) {
  return {
    ...validityData,
    state: {
      ...validityData.state,
      valid: !invalid && validityData.state.valid,
    },
  };
}
