// Base UI v1.8.0 CheckboxGroup native Svelte types. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface CheckboxGroupState extends FieldRootState {
  disabled: boolean;
}
export type CheckboxGroupChangeEventReason = 'none';
export type CheckboxGroupChangeEventDetails =
  BaseUIChangeEventDetails<CheckboxGroupChangeEventReason>;
export type CheckboxGroupProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<CheckboxGroupState> & {
    children?: Snippet | undefined;
    ref?: HTMLDivElement | null | undefined;
    value?: string[] | undefined;
    defaultValue?: string[] | undefined;
    onValueChange?:
      ((value: string[], details: CheckboxGroupChangeEventDetails) => void) | undefined;
    allValues?: string[] | undefined;
    disabled?: boolean | undefined;
  };
