// Assertions follow the value math in Base UI v1.8.0 ProgressRoot.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { computeProgress, normalizeProgressValue } from './compute.js';

describe('computeProgress', () => {
	it('treats null, undefined, and non-finite values as indeterminate', () => {
		for (const value of [
			null,
			undefined,
			Number.NaN,
			Number.POSITIVE_INFINITY,
			Number.NEGATIVE_INFINITY
		]) {
			expect(normalizeProgressValue(value)).toBe(value == null ? null : value);
			expect(
				computeProgress({ value: normalizeProgressValue(value), min: 0, max: 100 })
			).toMatchObject({
				status: 'indeterminate',
				percentageValue: null,
				clampedValue: null,
				formattedValue: '',
				defaultAriaValueText: 'indeterminate progress'
			});
		}
	});

	it('normalizes a custom range and clamps overshoot and undershoot', () => {
		expect(computeProgress({ value: 30, min: 20, max: 40 })).toMatchObject({
			status: 'progressing',
			percentageValue: 50,
			clampedValue: 30,
			formattedValue: (0.5).toLocaleString(undefined, { style: 'percent' })
		});

		expect(computeProgress({ value: 50, min: 0, max: 40 })).toMatchObject({
			status: 'complete',
			percentageValue: 100,
			clampedValue: 40
		});

		expect(computeProgress({ value: 10, min: 20, max: 40 })).toMatchObject({
			status: 'progressing',
			percentageValue: 0,
			clampedValue: 20
		});
	});

	it('formats the clamped value and keeps a zero percentage when min equals max', () => {
		const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
		const result = computeProgress({
			value: 50,
			min: 20,
			max: 40,
			format,
			locale: 'en-US'
		});
		expect(result.formattedValue).toBe(new Intl.NumberFormat('en-US', format).format(40));
		expect(result.clampedValue).toBe(40);

		expect(computeProgress({ value: 5, min: 5, max: 5 })).toMatchObject({
			status: 'complete',
			percentageValue: 0,
			clampedValue: 5,
			formattedValue: (0).toLocaleString(undefined, { style: 'percent' })
		});
	});
});
