// Base UI v1.8.0 Field adaptation; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLLabelAttributes, HTMLInputAttributes, ClassValue } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
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
  disabled?: boolean;
  name?: string;
  validate?: (value: unknown, formValues: FormValues) => string | string[] | null | void | Promise<string | string[] | null | void>;
  validationMode?: FormValidationMode;
  validationDebounceTime?: number;
  invalid?: boolean;
  dirty?: boolean;
  touched?: boolean;
  actionsRef?: { current: FieldRootActions | null };
};
export type FieldControlProps = Omit<ElementProps<FieldControlState, HTMLInputAttributes>, 'class' | 'disabled' | 'value' | 'defaultValue'> & {
  class?: ClassValue | ((state: FieldControlState) => ClassValue | undefined);
  disabled?: boolean;
  value?: string | number | readonly string[] | null;
  defaultValue?: string | number | readonly string[] | null;
  onValueChange?: (value: string, details: FieldControlChangeEventDetails) => void;
};
export type FieldControlState = FieldRootState;
export type FieldControlChangeEventReason = 'none';
export type FieldControlChangeEventDetails = BaseUIChangeEventDetails<FieldControlChangeEventReason>;
export type FieldLabelState = FieldRootState;
export type FieldLabelProps = NativeFieldProps<FieldLabelState, HTMLLabelAttributes> & { nativeLabel?: boolean };
export type FieldDescriptionState = FieldRootState;
export type FieldDescriptionProps = NativeFieldProps<FieldDescriptionState, HTMLAttributes<HTMLParagraphElement>>;
export type FieldItemState = FieldRootState;
export type FieldItemProps = NativeFieldProps<FieldItemState, HTMLAttributes<HTMLDivElement>> & { disabled?: boolean };
export type FieldTransitionStatus = 'starting' | 'ending' | 'idle' | undefined;
export interface FieldErrorState extends FieldRootState { transitionStatus: FieldTransitionStatus }
export type FieldErrorProps = NativeFieldProps<FieldErrorState, HTMLAttributes<HTMLDivElement>> & { match?: boolean | keyof ValidityState };
export interface FieldValidityState extends Omit<FieldValidityData, 'state'> {
  validity: FieldValidityData['state']; transitionStatus: FieldTransitionStatus;
}
export interface FieldValidityProps { children: Snippet<[FieldValidityState]> }
