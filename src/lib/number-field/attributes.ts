// Derived from Base UI v1.8.0 packages/react/src/number-field/utils/stateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { fieldValidityMapping } from '../field/attributes.js';
import type { NumberFieldRootState } from './types.js';

export const scrubbing = 'data-scrubbing';
export const disabled = 'data-disabled';
export const readOnly = 'data-readonly';
export const required = 'data-required';

export const numberFieldStateAttributes: StateAttributesMapping<NumberFieldRootState> = {
	inputValue: () => null,
	value: () => null,
	...fieldValidityMapping
};
