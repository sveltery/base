// Derived from Base UI v1.9.0 packages/utils/src/stringifyLocale.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// formatNumber uses this to build its formatter cache key.

export function stringifyLocale(locale?: Intl.LocalesArgument): string {
	if (Array.isArray(locale)) {
		return locale.map((value) => stringifyLocale(value)).join(',');
	}

	if (locale == null) {
		return '';
	}

	return String(locale);
}
