// Ported from Base UI v1.8.0 internals/form-context/FormContext.ts.
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { NOOP } from '../../utils/empty.js';
import type { FieldValidityData } from '../../field/types.js';
import type { FormErrors, FormValidationMode } from '../../form/types.js';
export interface RegisteredField {
  name: string | undefined;
  validate(): void;
  validityData: FieldValidityData;
  controlRef: { current: HTMLElement | null };
  getValue(): unknown;
}
export interface FormContext {
  readonly errors: FormErrors;
  clearErrors(name: string | undefined): void;
  elementRef: { current: HTMLFormElement | null };
  formRef: { current: { fields: Map<string, RegisteredField> } };
  readonly validationMode: FormValidationMode;
  submitCountRef: { current: number };
}
export const DEFAULT_FORM_CONTEXT: FormContext = {
  elementRef: { current: null }, formRef: { current: { fields: new Map() } },
  errors: {}, clearErrors: NOOP, validationMode: 'onSubmit', submitCountRef: { current: 0 },
};
const formKey = Symbol('base-ui-form');
export function setFormContext(value: FormContext) { setContext(formKey, value); }
export function useFormContext(): FormContext {
  return getContext<FormContext | undefined>(formKey) ?? DEFAULT_FORM_CONTEXT;
}
