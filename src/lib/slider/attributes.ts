// Derived from Base UI v1.8.0 packages/react/src/slider/root/stateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { fieldValidityMapping } from '../field/attributes.js';
import type { SliderRootState } from './types.js';

const nullMapping = () => null;

export const sliderStateAttributes: StateAttributesMapping<SliderRootState> = {
	activeThumbIndex: nullMapping,
	max: nullMapping,
	min: nullMapping,
	minStepsBetweenValues: nullMapping,
	step: nullMapping,
	values: nullMapping,
	...fieldValidityMapping
};
