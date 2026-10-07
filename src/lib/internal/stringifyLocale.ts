// Derived from Base UI v1.8.0 packages/utils/src/stringifyLocale.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
