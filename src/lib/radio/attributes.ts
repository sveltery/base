// Derived from Base UI v1.9.0
// packages/react/src/radio/utils/stateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { fieldValidityMapping } from '../field/attributes.js';
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { getStateAttributesProps, transitionStatusMapping } from '../internal/state-attributes.js';
import type { RadioIndicatorState, RadioRootState } from './types.js';

/** Present when the indicator begins animating in. */
export const startingStyle = 'data-starting-style';
/** Present when the indicator is animating out. */
export const endingStyle = 'data-ending-style';

function checkedAttributes(value: boolean): Record<string, string> {
	if (value) return { 'data-checked': '' };
	return { 'data-unchecked': '' };
}

export function radioRootAttributes(state: RadioRootState): Record<string, string> {
	const mapping: StateAttributesMapping<RadioRootState> = {
		...fieldValidityMapping,
		checked(value) {
			return checkedAttributes(value);
		}
	};
	return getStateAttributesProps(state, mapping);
}

export function radioIndicatorAttributes(state: RadioIndicatorState): Record<string, string> {
	const mapping: StateAttributesMapping<RadioIndicatorState> = {
		...fieldValidityMapping,
		checked(value) {
			return checkedAttributes(value);
		},
		...transitionStatusMapping
	};
	return getStateAttributesProps(state, mapping);
}
