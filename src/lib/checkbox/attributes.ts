// Derived from Base UI v1.9.0
// packages/react/src/checkbox/utils/getCheckboxStateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { fieldValidityMapping } from '../field/attributes.js';
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { getStateAttributesProps, transitionStatusMapping } from '../internal/state-attributes.js';
import type { CheckboxIndicatorState, CheckboxRootState } from './types.js';

/** Present when the indicator begins animating in. */
export const startingStyle = 'data-starting-style';
/** Present when the indicator is animating out. */
export const endingStyle = 'data-ending-style';

function checkedAttributes(state: CheckboxRootState, value: boolean): Record<string, string> {
	if (state.indeterminate) return {};
	if (value) return { 'data-checked': '' };
	return { 'data-unchecked': '' };
}

export function checkboxRootAttributes(state: CheckboxRootState): Record<string, string> {
	const mapping: StateAttributesMapping<CheckboxRootState> = {
		...fieldValidityMapping,
		checked(value) {
			return checkedAttributes(state, value);
		}
	};
	return getStateAttributesProps(state, mapping);
}

export function checkboxIndicatorAttributes(state: CheckboxIndicatorState): Record<string, string> {
	const mapping: StateAttributesMapping<CheckboxIndicatorState> = {
		...fieldValidityMapping,
		checked(value) {
			return checkedAttributes(state, value);
		},
		...transitionStatusMapping
	};
	return getStateAttributesProps(state, mapping);
}
