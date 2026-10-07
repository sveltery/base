// Assertions follow Base UI v1.8.0 packages/utils/src/stringifyLocale.test.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
