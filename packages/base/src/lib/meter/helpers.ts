// Private Meter closure from Base UI 47b40521; MIT: THIRD_PARTY_NOTICES.md.
import { clamp } from '@sveltery/utils/clamp';
import { formatNumber } from '@sveltery/utils/formatNumber';
// The pinned Meter parts use one frozen empty state.
export { EMPTY_OBJECT as emptyState } from '@sveltery/utils/empty';
export function normalize(
  value: number,
  min: number,
  max: number,
  locale?: Intl.LocalesArgument,
  format?: Intl.NumberFormatOptions,
) {
  const rawPercentage = ((value - min) * 100) / (max - min);
  const percentageValue = clamp(
    Number.isNaN(rawPercentage) ? 0 : rawPercentage,
    0,
    100,
  );
  const clampedValue = clamp(Number.isNaN(value) ? min : value, min, max);
  const formattedValue = format
    ? formatNumber(clampedValue, locale, format)
    : formatNumber(percentageValue / 100, locale, { style: 'percent' });
  return { percentageValue, clampedValue, formattedValue };
}
