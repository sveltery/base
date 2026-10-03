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
// Unparameterized source Form.Values intentionally permits schema-free field access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Preserve the pinned public default.
export type FormValues = Record<string, any>;
export type FormProps<Values extends FormValues = FormValues> = Omit<NativeFieldProps<FormState, HTMLFormAttributes>, 'render'> & {
  render?: Snippet<[HTMLFormAttributes & { noValidate?: boolean | undefined } & Record<string | symbol, unknown>, FormState, Snippet | undefined]> | undefined;
  noValidate?: boolean | undefined;
  validationMode?: FormValidationMode | undefined;
  errors?: FormErrors | undefined;
  onFormSubmit?: ((formValues: Values, details: FormSubmitEventDetails) => void) | undefined;
  actionsRef?: { current: FormActions | null } | undefined;
};
