// Derived from Base UI Input/Field.Control at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Input shares the Field.Control implementation.
import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface InputState {
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
  filled: boolean;
  focused: boolean;
  valid: boolean | null;
}
export type InputChangeEventReason = 'none';
export type InputChangeEventDetails = BaseUIChangeEventDetails<InputChangeEventReason>;
export type InputProps = Omit<ElementProps<InputState, HTMLInputAttributes>, 'class' | 'disabled' | 'value' | 'defaultValue'> & {
  class?: ClassValue | ((state: InputState) => ClassValue | undefined);
  disabled?: boolean;
  value?: string | number | readonly string[] | null;
  defaultValue?: string | number | readonly string[] | null;
  /** Runs for each native input edit. Controlled owners accept, reject or rewrite through value. */
  onValueChange?: (value: string, details: InputChangeEventDetails) => void;
};
