// Base UI v1.8.0 Form adaptation; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { NativeFieldProps } from '../field/props.js';
import type { BaseUIGenericEventDetails } from '../internals/createBaseUIEventDetails.js';
export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';
export type FormErrors = Record<string, string | string[]>;
export interface FormActions { validate(fieldName?: string): void }
export type FormState = Record<never, never>;
export type FormSubmitEventReason = 'none';
export type FormSubmitEventDetails = BaseUIGenericEventDetails<FormSubmitEventReason>;
export type FormValues = Record<string, unknown>;
export type FormProps<Values extends object = FormValues> = Omit<NativeFieldProps<FormState, HTMLFormAttributes>, 'render'> & {
  render?: Snippet<[HTMLFormAttributes & Record<string | symbol, unknown>, FormState, Snippet | undefined]>;
  validationMode?: FormValidationMode;
  errors?: FormErrors;
  onFormSubmit?: (formValues: Values, details: FormSubmitEventDetails) => void;
  actionsRef?: { current: FormActions | null };
};
