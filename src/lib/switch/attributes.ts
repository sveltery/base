// Derived from Base UI v1.9.0 packages/react/src/switch/stateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { fieldValidityMapping } from '../field/attributes.js';
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { SwitchRootState } from './types.js';

export const switchStateAttributesMapping: StateAttributesMapping<SwitchRootState> = {
	...fieldValidityMapping,
	checked(value): Record<string, string> {
		if (value) return { 'data-checked': '' };
		return { 'data-unchecked': '' };
	}
};
