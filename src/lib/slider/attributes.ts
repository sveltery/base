// Derived from Base UI v1.9.0 packages/react/src/slider/root/stateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

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
