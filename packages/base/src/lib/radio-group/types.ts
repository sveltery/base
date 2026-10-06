// Base UI v1.8.0 RadioGroup public types, native Svelte props/snippets. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface RadioGroupState extends FieldRootState {
  required: boolean;
  readOnly: boolean;
}
export type RadioGroupChangeEventReason = 'none';
export type RadioGroupChangeEventDetails = BaseUIChangeEventDetails<RadioGroupChangeEventReason>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Preserve the pinned public generic default.
export type RadioGroupProps<Value = any> = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<RadioGroupState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    name?: string | undefined;
    form?: string | undefined;
    value?: Value | undefined;
    defaultValue?: Value | undefined;
    onValueChange?: ((value: Value, details: RadioGroupChangeEventDetails) => void) | undefined;
    inputRef?: HTMLInputElement | null | undefined;
  };
