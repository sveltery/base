import { describe, expect, it } from 'vitest';
import { DEFAULT_VALIDITY_STATE } from './constants.js';
import { getCombinedFieldValidityData } from './validity.js';

describe('getCombinedFieldValidityData', () => {
	const base = {
		state: { ...DEFAULT_VALIDITY_STATE, valid: true as boolean | null },
		error: '',
		errors: [] as string[],
		value: 'a',
		initialValue: ''
	};

	it('forces invalid when the external flag is set', () => {
		expect(getCombinedFieldValidityData(base, true).state.valid).toBe(false);
	});

	it('keeps a neutral verdict when the field is not externally invalid', () => {
		expect(
			getCombinedFieldValidityData({ ...base, state: { ...base.state, valid: null } }, false).state
				.valid
		).toBe(null);
	});
});
