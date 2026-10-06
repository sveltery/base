// Base UI v1.8.0 packages/utils/src/formatNumber.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { stringifyLocale } from './stringifyLocale.js';

const cache = new Map<string, Intl.NumberFormat>();

export function getFormatter(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  const optionsString = JSON.stringify({ locale: stringifyLocale(locale), options });
  const cachedFormatter = cache.get(optionsString);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.NumberFormat(locale, options);
  cache.set(optionsString, formatter);

  return formatter;
}

export function formatNumber(
  value: number | null,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  if (value == null) {
    return '';
  }
  return getFormatter(locale, options).format(value);
}
