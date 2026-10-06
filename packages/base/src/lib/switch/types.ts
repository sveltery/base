// Base UI v1.8.0 Switch public types, native Svelte props/snippets. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { MergedRef } from '@sveltery/utils/useMergedRefs';
export interface SwitchRootState extends FieldRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}
export type SwitchRootChangeEventReason = 'none';
export type SwitchRootChangeEventDetails = BaseUIChangeEventDetails<SwitchRootChangeEventReason>;
export type SwitchRootProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLElement>>,
  'class' | 'style' | 'children' | 'onchange'
> &
  BaseUIComponentProps<SwitchRootState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    id?: string | undefined;
    checked?: boolean | undefined;
    defaultChecked?: boolean | undefined;
    disabled?: boolean | undefined;
    inputRef?: MergedRef<HTMLInputElement> | null | undefined;
    name?: string | undefined;
    form?: string | undefined;
    nativeButton?: boolean | undefined;
    onCheckedChange?:
      ((checked: boolean, details: SwitchRootChangeEventDetails) => void) | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    uncheckedValue?: string | undefined;
    value?: string | undefined;
  };
export type SwitchThumbState = SwitchRootState;
export type SwitchThumbProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLSpanElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<SwitchThumbState> & {
    children?: Snippet | undefined;
    ref?: HTMLSpanElement | null | undefined;
  };
