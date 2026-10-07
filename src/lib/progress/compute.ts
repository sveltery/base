// The value normalization in Base UI v1.8.0 packages/react/src/progress/root/ProgressRoot.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { clamp } from '../internal/clamp.js';
import { formatNumber } from '../internal/formatNumber.js';
import { valueToPercent } from '../internal/valueToPercent.js';
import type { ProgressStatus } from './types.js';

export interface ProgressInputs {
	value: number | null;
	min: number;
	max: number;
	format?: Intl.NumberFormatOptions;
	locale?: Intl.LocalesArgument;
}

export interface ProgressComputation {
	status: ProgressStatus;
	percentageValue: number | null;
	clampedValue: number | null;
	formattedValue: string;
	defaultAriaValueText: string;
}

export function normalizeProgressValue(value: number | null | undefined): number | null {
	return value == null ? null : value;
}

/**
 * `value === null` (or any non-finite value) keeps Progress indeterminate. Otherwise compute a
 * single clamped value and normalized percentage so completion status, `aria-valuenow`, the
 * formatted text, the default `aria-valuetext`, and the indicator width all stay in sync for any
 * `min`/`max` (not just the default 0–100).
 */
export function computeProgress(input: ProgressInputs): ProgressComputation {
	let status: ProgressStatus = 'indeterminate';
	let percentageValue: number | null = null;
	let clampedValue: number | null = null;
	let formattedValue = '';
	// Derived alongside `status` so the indeterminate condition is not restated anywhere else.
	let defaultAriaValueText = 'indeterminate progress';

	if (input.value != null && Number.isFinite(input.value)) {
		const rawPercentage = valueToPercent(input.value, input.min, input.max);
		percentageValue = clamp(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 0, 100);
		clampedValue = clamp(input.value, input.min, input.max);
		status = clampedValue === input.max ? 'complete' : 'progressing';
		// Format the clamped value so visible and accessible text stay in sync with `aria-valuenow`
		// and the indicator fill. The raw value remains available as the second `getAriaValueText`
		// argument.
		formattedValue = input.format
			? formatNumber(clampedValue, input.locale, input.format)
			: formatNumber(percentageValue / 100, input.locale, { style: 'percent' });
		defaultAriaValueText = formattedValue;
	}

	return { status, percentageValue, clampedValue, formattedValue, defaultAriaValueText };
}
