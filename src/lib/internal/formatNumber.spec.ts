// Assertions follow Base UI v1.8.0 packages/utils/src/formatNumber.test.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Expected strings are literals for en-US rather than a second Intl.NumberFormat call.
import { describe, expect, it } from 'vitest';
import { formatNumber, getFormatter } from './formatNumber.js';

const currencyOptions = (): Intl.NumberFormatOptions => ({
	currency: 'USD',
	style: 'currency',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

describe('formatNumber', () => {
	describe('getFormatter', () => {
		it('caches the formatter based on options', () => {
			const formatter1 = getFormatter(undefined, currencyOptions());
			const formatter2 = getFormatter(undefined, currencyOptions());
			expect(formatter1).toBe(formatter2);
		});

		it('caches different Intl.Locale objects separately', () => {
			const formatter1 = getFormatter(new Intl.Locale('fr-FR'), currencyOptions());
			const formatter2 = getFormatter(new Intl.Locale('en-US'), currencyOptions());

			expect(formatter1).not.toBe(formatter2);
			expect(formatter1.resolvedOptions().locale).toBe('fr-FR');
			expect(formatter2.resolvedOptions().locale).toBe('en-US');
		});
	});

	describe('formatNumber', () => {
		it('formats a number', () => {
			expect(formatNumber(1234.56, 'en-US', currencyOptions())).toBe('$1,234.56');
		});

		it('formats a number with different options', () => {
			expect(formatNumber(0.1234, 'en-US', { style: 'percent' })).toBe('12%');
		});

		it('returns an empty string for null', () => {
			expect(formatNumber(null, 'en-US', currencyOptions())).toBe('');
			expect(formatNumber(null)).toBe('');
		});
	});
});
