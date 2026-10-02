// Private Meter closure from Base UI 47b40521; MIT: THIRD_PARTY_NOTICES.md.
// Pinned useRenderElement defaults every Meter part to one frozen empty state.
export const emptyState = Object.freeze({});
const cache = new Map<string, Intl.NumberFormat>();
function stringifyLocale(locale?: Intl.LocalesArgument): string {
  if (Array.isArray(locale)) return locale.map(value => stringifyLocale(value)).join(',');
  return locale == null ? '' : String(locale);
}
function formatNumber(value: number, locale: Intl.LocalesArgument | undefined, options: Intl.NumberFormatOptions) {
  const key = JSON.stringify({ locale: stringifyLocale(locale), options });
  let formatter = cache.get(key);
  if (!formatter) { formatter = new Intl.NumberFormat(locale, options); cache.set(key, formatter); }
  return formatter.format(value);
}
export function normalize(value: number, min: number, max: number, locale?: Intl.LocalesArgument, format?: Intl.NumberFormatOptions) {
  const rawPercentage = ((value - min) * 100) / (max - min);
  const percentageValue = Math.max(0, Math.min(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 100));
  const clampedValue = Math.max(min, Math.min(Number.isNaN(value) ? min : value, max));
  const formattedValue = format ? formatNumber(clampedValue, locale, format) : formatNumber(percentageValue / 100, locale, { style: 'percent' });
  return { percentageValue, clampedValue, formattedValue };
}
export const visuallyHidden = 'clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:fixed;top:0;left:0';
