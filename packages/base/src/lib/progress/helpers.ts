// Private Progress closure from Base UI 47b40521; MIT: THIRD_PARTY_NOTICES.md.
import { clamp } from '@sveltery/utils/clamp';
import { formatNumber } from '@sveltery/utils/formatNumber';
import type { ProgressStatus } from './types.js';
export function normalize(value: number | null, min: number, max: number, locale?: Intl.LocalesArgument, format?: Intl.NumberFormatOptions) {
  let status: ProgressStatus = 'indeterminate';
  let percentageValue: number | null = null, clampedValue: number | null = null;
  let formattedValue = '', defaultAriaValueText = 'indeterminate progress';
  if (value != null && Number.isFinite(value)) {
    const rawPercentage = ((value - min) * 100) / (max - min);
    percentageValue = clamp(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 0, 100);
    clampedValue = clamp(value, min, max);
    status = clampedValue === max ? 'complete' : 'progressing';
    formattedValue = format ? formatNumber(clampedValue, locale, format) : formatNumber(percentageValue / 100, locale, { style: 'percent' });
    defaultAriaValueText = formattedValue;
  }
  return { state: { status }, percentageValue, clampedValue, formattedValue, defaultAriaValueText };
}
export function statusAttributes(status: ProgressStatus) { return { [`data-${status}`]: '' }; }
