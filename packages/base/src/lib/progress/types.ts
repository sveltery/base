// Adapted from Base UI v1.8.0 Progress; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { ClassValue, HTMLAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete';
export interface ProgressRootState {
  status: ProgressStatus;
}
export type ProgressLabelState = ProgressRootState;
export type ProgressTrackState = ProgressRootState;
export type ProgressIndicatorState = ProgressRootState;
export type ProgressValueState = ProgressRootState;
type PartProps<Node extends HTMLElement> = Omit<
  ElementProps<ProgressRootState, HTMLAttributes<Node>>,
  'class'
> & {
  class?: ClassValue | ((state: ProgressRootState) => ClassValue);
};
export type ProgressRootProps = PartProps<HTMLDivElement> & {
  value: number | null;
  min?: number;
  max?: number;
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  getAriaValueText?: (formattedValue: string, value: number | null) => string;
};
export type ProgressLabelProps = PartProps<HTMLSpanElement>;
export type ProgressTrackProps = PartProps<HTMLDivElement>;
export type ProgressIndicatorProps = PartProps<HTMLDivElement>;
export type ProgressValueProps = Omit<PartProps<HTMLSpanElement>, 'children'> & {
  children?: Snippet<[string | null, number | null]> | null;
};
