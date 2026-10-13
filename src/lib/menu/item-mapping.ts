// Derived from Base UI v1.9.0 packages/react/src/menu/utils/stateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import {
	transitionStatusMapping,
	type StateAttributesMapping
} from '../internal/state-attributes.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';

export const itemMapping: StateAttributesMapping<{
	checked: boolean;
	transitionStatus?: TransitionStatusValue;
}> = {
	checked(value): Record<string, string> {
		return value ? { 'data-checked': '' } : { 'data-unchecked': '' };
	},
	...transitionStatusMapping
};
