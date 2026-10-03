// Base UI v1.8.0 Checkbox native Svelte types. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { MergedRef } from '../utils/useMergedRefs.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export interface CheckboxRootState extends FieldRootState { checked: boolean; disabled: boolean; readOnly: boolean; required: boolean; indeterminate: boolean }
export type CheckboxRootChangeEventReason = 'none';
export type CheckboxRootChangeEventDetails = BaseUIChangeEventDetails<CheckboxRootChangeEventReason>;
export type CheckboxRootProps = Omit<WithBaseUIEvent<HTMLAttributes<HTMLElement>>, 'class' | 'style' | 'children' | 'onchange'> & BaseUIComponentProps<CheckboxRootState> & {
  children?: Snippet; ref?: HTMLElement | null; id?: string; name?: string; form?: string;
  checked?: boolean; defaultChecked?: boolean; disabled?: boolean;
  onCheckedChange?: (checked: boolean, details: CheckboxRootChangeEventDetails) => void;
  readOnly?: boolean; required?: boolean; indeterminate?: boolean;
  inputRef?: MergedRef<HTMLInputElement>; parent?: boolean; uncheckedValue?: string;
  value?: string; nativeButton?: boolean;
};
export interface CheckboxIndicatorState extends CheckboxRootState { transitionStatus: TransitionStatus }
export type CheckboxIndicatorProps = Omit<WithBaseUIEvent<HTMLAttributes<HTMLSpanElement>>, 'class' | 'style' | 'children'> & BaseUIComponentProps<CheckboxIndicatorState> & { children?: Snippet; ref?: HTMLSpanElement | null; keepMounted?: boolean };
