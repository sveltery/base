// Original Base UI v1.8.0 stringifyLocale.test.ts at immutable 47b40521 (MIT).
// Original assertions retained; package import adaptation only.
import { expect, describe, it } from 'vitest';
import { stringifyLocale } from '@sveltery/utils/stringifyLocale';

describe('stringifyLocale', () => {
  it('stringifies Intl locale arguments for cache keys', () => {
    expect(stringifyLocale()).toBe('');
    expect(stringifyLocale('en-US')).toBe('en-US');
    expect(stringifyLocale(new Intl.Locale('fr-FR'))).toBe('fr-FR');
    expect(stringifyLocale(['fr-FR', new Intl.Locale('en-US')])).toBe('fr-FR,en-US');
  });
});
