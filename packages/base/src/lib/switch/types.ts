// Base UI v1.8.0 Switch public types, native Svelte props/snippets. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { MergedRef } from '../utils/useMergedRefs.js';
export interface SwitchRootState extends FieldRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}
export type SwitchRootChangeEventReason = 'none';
export type SwitchRootChangeEventDetails =
  BaseUIChangeEventDetails<SwitchRootChangeEventReason>;
export type SwitchRootProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLElement>>,
  'class' | 'style' | 'children' | 'onchange'
> &
  BaseUIComponentProps<SwitchRootState> & {
    children?: Snippet;
    ref?: HTMLElement | null;
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    inputRef?: MergedRef<HTMLInputElement>;
    name?: string;
    form?: string;
    nativeButton?: boolean;
    onCheckedChange?: (checked: boolean, details: SwitchRootChangeEventDetails) => void;
    readOnly?: boolean;
    required?: boolean;
    uncheckedValue?: string;
    value?: string;
  };
export type SwitchThumbState = SwitchRootState;
export type SwitchThumbProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLSpanElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<SwitchThumbState> & {
    children?: Snippet;
    ref?: HTMLSpanElement | null;
  };
