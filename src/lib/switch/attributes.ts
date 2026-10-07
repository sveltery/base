// Derived from Base UI v1.8.0 packages/react/src/switch/stateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field validity attributes are not included. Field is not ported.
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { SwitchRootState } from './types.js';

export const switchStateAttributesMapping: StateAttributesMapping<SwitchRootState> = {
	checked(value): Record<string, string> {
		if (value) return { 'data-checked': '' };
		return { 'data-unchecked': '' };
	}
};
