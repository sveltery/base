// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
export function stringifyLocale(locale?: Intl.LocalesArgument): string {
  if (Array.isArray(locale)) {
    return locale.map((value) => stringifyLocale(value)).join(',');
  }

  if (locale == null) {
    return '';
  }

  return String(locale);
}
