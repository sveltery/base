// Base UI v1.8.0 Radio public types, native Svelte props/snippets. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
  BaseUIComponentProps,
  WithBaseUIEvent,
} from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { MergedRef } from '../utils/useMergedRefs.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export interface RadioRootState extends FieldRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}
export type RadioRootProps<Value = unknown> = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<RadioRootState> & {
    children?: Snippet;
    ref?: HTMLElement | null;
    value: Value;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    inputRef?: MergedRef<HTMLInputElement>;
    nativeButton?: boolean;
  };
export interface RadioIndicatorState extends RadioRootState {
  transitionStatus: TransitionStatus;
}
export type RadioIndicatorProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLSpanElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<RadioIndicatorState> & {
    children?: Snippet;
    ref?: HTMLElement | null;
    keepMounted?: boolean;
  };
