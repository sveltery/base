// Assertions follow Base UI v1.9.0 packages/utils/src/stringifyLocale.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { stringifyLocale } from './stringifyLocale.js';

describe('stringifyLocale', () => {
	it('stringifies Intl locale arguments for cache keys', () => {
		expect(stringifyLocale()).toBe('');
		expect(stringifyLocale('en-US')).toBe('en-US');
		expect(stringifyLocale(new Intl.Locale('fr-FR'))).toBe('fr-FR');
		expect(stringifyLocale(['fr-FR', new Intl.Locale('en-US')])).toBe('fr-FR,en-US');
	});
});
