// Base UI v1.8.0 Field adaptation; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLLabelAttributes, HTMLInputAttributes, ClassValue } from 'svelte/elements';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { NativeFieldProps } from './props.js';
import type { FormValidationMode, FormValues } from '../form/types.js';
export interface FieldRootState {
  disabled: boolean; touched: boolean; dirty: boolean; filled: boolean; focused: boolean; valid: boolean | null;
}
export interface FieldValidityData {
  state: { -readonly [Key in keyof ValidityState]: Key extends 'valid' ? boolean | null : boolean };
  error: string; errors: string[]; value: unknown; initialValue: unknown;
}
export interface FieldRootActions { validate(): void }
export type FieldRootProps = NativeFieldProps<FieldRootState, HTMLAttributes<HTMLDivElement>> & {
  disabled?: boolean | undefined;
  name?: string | undefined;
  validate?: ((value: unknown, formValues: FormValues) => string | string[] | null | void | Promise<string | string[] | null | void>) | undefined;
  validationMode?: FormValidationMode | undefined;
  validationDebounceTime?: number | undefined;
  invalid?: boolean | undefined;
  dirty?: boolean | undefined;
  touched?: boolean | undefined;
  actionsRef?: { current: FieldRootActions | null } | undefined;
};
export type FieldControlProps = Omit<NativeFieldProps<FieldControlState, HTMLInputAttributes>, 'disabled' | 'value' | 'defaultValue'> & {
  class?: ClassValue | ((state: FieldControlState) => ClassValue | undefined) | undefined;
  disabled?: boolean | undefined;
  value?: string | number | readonly string[] | null | undefined;
  defaultValue?: string | number | readonly string[] | null | undefined;
  onValueChange?: ((value: string, details: FieldControlChangeEventDetails) => void) | undefined;
};
export type FieldControlState = FieldRootState;
export type FieldControlChangeEventReason = 'none';
export type FieldControlChangeEventDetails = BaseUIChangeEventDetails<FieldControlChangeEventReason>;
export type FieldLabelState = FieldRootState;
export type FieldLabelProps = NativeFieldProps<FieldLabelState, HTMLLabelAttributes> & { nativeLabel?: boolean | undefined };
export type FieldDescriptionState = FieldRootState;
export type FieldDescriptionProps = NativeFieldProps<FieldDescriptionState, HTMLAttributes<HTMLParagraphElement>>;
export type FieldItemState = FieldRootState;
export type FieldItemProps = NativeFieldProps<FieldItemState, HTMLAttributes<HTMLDivElement>> & { disabled?: boolean | undefined };
export type FieldTransitionStatus = 'starting' | 'ending' | 'idle' | undefined;
export interface FieldErrorState extends FieldRootState { transitionStatus: FieldTransitionStatus }
export type FieldErrorProps = NativeFieldProps<FieldErrorState, HTMLAttributes<HTMLDivElement>> & { match?: boolean | keyof ValidityState | undefined };
export interface FieldValidityState extends Omit<FieldValidityData, 'state'> {
  validity: FieldValidityData['state']; transitionStatus: FieldTransitionStatus;
}
export interface FieldValidityProps { children: Snippet<[FieldValidityState]> }
