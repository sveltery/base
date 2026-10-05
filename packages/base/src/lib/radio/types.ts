// Base UI v1.8.0 Radio public types, native Svelte props/snippets. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { MergedRef } from '@sveltery/utils/useMergedRefs';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export interface RadioRootState extends FieldRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Preserve the pinned public generic default.
export type RadioRootProps<Value = any> = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<RadioRootState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    value: Value;
    disabled?: boolean | undefined;
    required?: boolean | undefined;
    readOnly?: boolean | undefined;
    inputRef?: MergedRef<HTMLInputElement> | null | undefined;
    nativeButton?: boolean | undefined;
  };
export interface RadioIndicatorState extends RadioRootState {
  transitionStatus: TransitionStatus;
}
export type RadioIndicatorProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLSpanElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<RadioIndicatorState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    keepMounted?: boolean | undefined;
  };
