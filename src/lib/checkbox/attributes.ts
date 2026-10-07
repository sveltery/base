// Derived from Base UI v1.8.0
// packages/react/src/checkbox/utils/getCheckboxStateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field validity attributes are not included. Field is not ported.
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import { getStateAttributesProps } from '../internal/state-attributes.js';
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
		checked(value) {
			return checkedAttributes(state, value);
		}
	};
	return getStateAttributesProps(state, mapping);
}

export function checkboxIndicatorAttributes(state: CheckboxIndicatorState): Record<string, string> {
	const mapping: StateAttributesMapping<CheckboxIndicatorState> = {
		checked(value) {
			return checkedAttributes(state, value);
		},
		transitionStatus(value): Record<string, string> | null {
			if (value === 'starting') return { [startingStyle]: '' };
			if (value === 'ending') return { [endingStyle]: '' };
			return null;
		}
	};
	return getStateAttributesProps(state, mapping);
}
