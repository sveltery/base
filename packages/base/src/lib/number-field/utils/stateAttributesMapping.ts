// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import type { NumberFieldRootState } from '../types.js';
import { fieldValidityMapping } from '../../internals/field-constants/constants.js';

export const stateAttributesMapping: StateAttributesMapping<NumberFieldRootState> = {
  inputValue: () => null,
  value: () => null,
  ...fieldValidityMapping,
};
