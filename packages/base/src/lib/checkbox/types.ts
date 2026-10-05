// Base UI v1.8.0 Checkbox native Svelte types. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
  BaseUIComponentProps,
  WithBaseUIEvent,
} from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export interface CheckboxRootState extends FieldRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  indeterminate: boolean;
}
export type CheckboxRootChangeEventReason = 'none';
export type CheckboxRootChangeEventDetails =
  BaseUIChangeEventDetails<CheckboxRootChangeEventReason>;
export type CheckboxRootProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLElement>>,
  'class' | 'style' | 'children' | 'onchange'
> &
  BaseUIComponentProps<CheckboxRootState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    id?: string | undefined;
    name?: string | undefined;
    form?: string | undefined;
    checked?: boolean | undefined;
    defaultChecked?: boolean | undefined;
    disabled?: boolean | undefined;
    onCheckedChange?:
      | ((checked: boolean, details: CheckboxRootChangeEventDetails) => void)
      | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    indeterminate?: boolean | undefined;
    inputRef?: HTMLInputElement | null | undefined;
    parent?: boolean | undefined;
    uncheckedValue?: string | undefined;
    value?: string | undefined;
    nativeButton?: boolean | undefined;
  };
export interface CheckboxIndicatorState extends CheckboxRootState {
  transitionStatus: TransitionStatus;
}
export type CheckboxIndicatorProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLSpanElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<CheckboxIndicatorState> & {
    children?: Snippet | undefined;
    ref?: HTMLSpanElement | null | undefined;
    keepMounted?: boolean | undefined;
  };
