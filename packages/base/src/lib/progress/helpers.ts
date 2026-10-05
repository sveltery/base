// Private Progress closure from Base UI 47b40521; MIT: THIRD_PARTY_NOTICES.md.
import type { ProgressStatus } from './types.js';
const cache = new Map<string, Intl.NumberFormat>();
function stringifyLocale(locale?: Intl.LocalesArgument): string {
  if (Array.isArray(locale)) return locale.map((value) => stringifyLocale(value)).join(',');
  return locale == null ? '' : String(locale);
}
function formatNumber(
  value: number,
  locale: Intl.LocalesArgument | undefined,
  options: Intl.NumberFormatOptions,
) {
  const key = JSON.stringify({ locale: stringifyLocale(locale), options });
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter.format(value);
}
export function normalize(
  value: number | null,
  min: number,
  max: number,
  locale?: Intl.LocalesArgument,
  format?: Intl.NumberFormatOptions,
) {
  let status: ProgressStatus = 'indeterminate';
  let percentageValue: number | null = null,
    clampedValue: number | null = null;
  let formattedValue = '',
    defaultAriaValueText = 'indeterminate progress';
  if (value != null && Number.isFinite(value)) {
    const rawPercentage = ((value - min) * 100) / (max - min);
    percentageValue = Math.max(0, Math.min(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 100));
    clampedValue = Math.max(min, Math.min(value, max));
    status = clampedValue === max ? 'complete' : 'progressing';
    formattedValue = format
      ? formatNumber(clampedValue, locale, format)
      : formatNumber(percentageValue / 100, locale, { style: 'percent' });
    defaultAriaValueText = formattedValue;
  }
  return { state: { status }, percentageValue, clampedValue, formattedValue, defaultAriaValueText };
}
export function statusAttributes(status: ProgressStatus) {
  return { [`data-${status}`]: '' };
}
export const visuallyHidden =
  'clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:fixed;top:0;left:0';
