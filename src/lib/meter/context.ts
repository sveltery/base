// Derived from Base UI v1.8.0 packages/react/src/meter/root/MeterRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { defineContext } from '../internal/context.js';

export type MeterRootContextValue = {
	/** Localized text for the clamped value. Visible value and `aria-valuetext` start from this. */
	readonly formattedValue: string;
	/**
	 * The value normalized to a `0`–`100` percentage of the range, clamped to those bounds.
	 */
	readonly percentageValue: number;
	/** The raw `value` prop. Not clamped. */
	readonly value: number;
	/** Id of the active label, when one is mounted. */
	labelId: string | undefined;
};

export const [useMeterRootContext, setMeterRootContext] = defineContext<MeterRootContextValue>(
	'Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.'
);
