// Assertions from Base UI v1.8.0 packages/react/src/slider/utils/roundValueToStep.test.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { describe, expect, it } from 'vitest';
import { roundValueToStep } from './roundValueToStep.js';

describe('roundValueToStep', () => {
	it('preserves precision from the step origin', () => {
		expect(roundValueToStep(0.35, 0.1, 0.25)).toBe(0.35);
	});

	it('preserves decimal precision for steps greater than one', () => {
		expect(roundValueToStep(13.2, 1.5, 10.2)).toBe(13.2);
	});
});
