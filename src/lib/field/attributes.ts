// Derived from Base UI v1.8.0 field data attributes and
// packages/react/src/internals/field-constants/constants.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { FieldRootState } from './types.js';

/** Present when the field is disabled. */
export const disabled = 'data-disabled';
/** Present when the field is valid. */
export const valid = 'data-valid';
/** Present when the field is invalid. */
export const invalid = 'data-invalid';
/** Present when the field has been touched. */
export const touched = 'data-touched';
/** Present when the field's value has changed. */
export const dirty = 'data-dirty';
/** Present when the field is filled. */
export const filled = 'data-filled';
/** Present when the field control is focused. */
export const focused = 'data-focused';
/** Present when the error begins animating in. */
export const startingStyle = 'data-starting-style';
/** Present when the error is animating out. */
export const endingStyle = 'data-ending-style';

const STARTING_HOOK = { [startingStyle]: '' };
const ENDING_HOOK = { [endingStyle]: '' };

export const fieldValidityMapping: StateAttributesMapping<FieldRootState> = {
	valid(value): Record<string, string> | null {
		if (value === null) return null;
		if (value) return { [valid]: '' };
		return { [invalid]: '' };
	}
};

export const transitionStatusMapping: StateAttributesMapping<{
	transitionStatus: 'starting' | 'ending' | 'idle' | undefined;
}> = {
	transitionStatus(value) {
		if (value === 'starting') return STARTING_HOOK;
		if (value === 'ending') return ENDING_HOOK;
		return null;
	}
};
