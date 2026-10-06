// Native public type port of Base UI v1.8.0 OTPFieldRoot/Input at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type {
  BaseUIChangeEventDetails,
  BaseUIGenericEventDetails,
} from '../internals/createBaseUIEventDetails.js';
import type { OTPValidationType } from './utils/otp.js';
export type { OTPValidationType };
export interface OTPFieldRootState extends FieldRootState {
  complete: boolean;
  length: number;
  readOnly: boolean;
  required: boolean;
  value: string;
}
export type OTPFieldRootChangeEventReason =
  'input-change' | 'input-clear' | 'input-paste' | 'keyboard';
export type OTPFieldRootChangeEventDetails =
  BaseUIChangeEventDetails<OTPFieldRootChangeEventReason>;
export type OTPFieldRootInvalidEventReason = 'input-change' | 'input-paste';
export type OTPFieldRootInvalidEventDetails =
  BaseUIGenericEventDetails<OTPFieldRootInvalidEventReason>;
export type OTPFieldRootCompleteEventReason = 'input-change' | 'input-paste';
export type OTPFieldRootCompleteEventDetails =
  BaseUIGenericEventDetails<OTPFieldRootCompleteEventReason>;
export type OTPFieldRootProps = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>,
  'class' | 'style' | 'children' | 'onchange'
> &
  BaseUIComponentProps<OTPFieldRootState> & {
    /** Number of slots; required for normalization, completion and SSR validation markup. */
    length: number;
    autoComplete?: string | undefined;
    defaultValue?: string | undefined;
    value?: string | undefined;
    onValueChange?: ((value: string, details: OTPFieldRootChangeEventDetails) => void) | undefined;
    onValueInvalid?:
      ((value: string, details: OTPFieldRootInvalidEventDetails) => void) | undefined;
    onValueComplete?:
      ((value: string, details: OTPFieldRootCompleteEventDetails) => void) | undefined;
    form?: string | undefined;
    autoSubmit?: boolean | undefined;
    mask?: boolean | undefined;
    inputMode?: HTMLInputAttributes['inputmode'] | undefined;
    validationType?: OTPValidationType | undefined;
    normalizeValue?: ((value: string) => string) | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    name?: string | undefined;
    children?: Snippet | undefined;
    /** Actual rendered Root host; supports bind:ref. */
    ref?: HTMLElement | null | undefined;
  };
export interface OTPFieldInputState extends Omit<OTPFieldRootState, 'filled' | 'value'> {
  filled: boolean;
  index: number;
  value: string;
}
export type OTPFieldInputProps = Omit<
  WithBaseUIEvent<HTMLInputAttributes>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<OTPFieldInputState> & {
    /** Actual rendered Input host; supports bind:ref. Slot order is inferred. */
    ref?: HTMLElement | null | undefined;
  };
