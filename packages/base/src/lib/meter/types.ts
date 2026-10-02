// Adapted from Base UI v1.8.0 Meter; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { ClassValue, HTMLAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
export type MeterRootState = Record<string, never>;
export type MeterLabelState = MeterRootState;
export type MeterTrackState = MeterRootState;
export type MeterIndicatorState = MeterRootState;
export type MeterValueState = MeterRootState;
type PartProps<Node extends HTMLElement> = Omit<ElementProps<MeterRootState, HTMLAttributes<Node>>, 'class'> & {
  class?: ClassValue | ((state: MeterRootState) => ClassValue);
};
export type MeterRootProps = PartProps<HTMLDivElement> & {
  value: number;
  min?: number;
  max?: number;
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  getAriaValueText?: (formattedValue: string, value: number) => string;
};
export type MeterLabelProps = PartProps<HTMLSpanElement>;
export type MeterTrackProps = PartProps<HTMLDivElement>;
export type MeterIndicatorProps = PartProps<HTMLDivElement>;
export type MeterValueProps = Omit<PartProps<HTMLSpanElement>, 'children'> & {
  children?: Snippet<[string, number]> | null;
};
