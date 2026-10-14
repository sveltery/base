// Assertions follow Base UI v1.9.0 packages/react/src/internals/filter.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { getFilter } from './filter.js';

describe('getFilter', () => {
	it('caches different locales separately', () => {
		const filter1 = getFilter({ locale: new Intl.Locale('fr-FR') });
		const filter2 = getFilter({ locale: new Intl.Locale('en-US') });
		expect(filter1).not.toBe(filter2);
	});

	it('caches equivalent locale inputs', () => {
		const filter1 = getFilter({ locale: new Intl.Locale('fr-FR') });
		const filter2 = getFilter({ locale: 'fr-FR' });
		expect(filter1).toBe(filter2);
	});

	it('matches locale-aware substrings without accent sensitivity', () => {
		const { contains, startsWith, endsWith } = getFilter({ locale: 'en-US' });
		expect(contains('Résumé', 'resume')).toBe(true);
		expect(contains('Résumé', 'sum')).toBe(true);
		expect(contains('Résumé', 'xyz')).toBe(false);
		expect(startsWith('Résumé', 'res')).toBe(true);
		expect(startsWith('Résumé', 'sum')).toBe(false);
		expect(endsWith('Résumé', 'ume')).toBe(true);
		expect(endsWith('Résumé', 'res')).toBe(false);
	});

	it('reads an object label, then its value', () => {
		const { contains } = getFilter({ locale: 'en-US' });
		expect(contains({ label: 'Apple', value: 'a' }, 'app')).toBe(true);
		expect(contains({ value: 'banana' }, 'nan')).toBe(true);
		expect(contains('Cherry', 'err', (text) => text.toUpperCase())).toBe(true);
	});
});
