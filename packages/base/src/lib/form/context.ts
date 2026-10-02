// Base UI v1.8.0 Form context adaptation; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { FieldValidityData } from '../field/types.js';
import type { FormErrors, FormValidationMode, FormValues } from './types.js';
export interface RegisteredField {
  readonly name: string | undefined;
  readonly validityData: FieldValidityData;
  readonly control: HTMLElement | null;
  validate(): void;
  getValue(): unknown;
}
export interface FormContext {
  readonly element: HTMLFormElement | null;
  readonly errors: FormErrors;
  readonly validationMode: FormValidationMode;
  readonly fields: Map<string, RegisteredField>;
  readonly submitCount: number;
  clearErrors(name: string | undefined): void;
}
const key = Symbol('base-ui-form');
export function setFormContext(value: FormContext) { setContext(key, value); }
export function getFormContext(): FormContext | undefined { return getContext(key); }
export function getFormValues(context: FormContext | undefined): FormValues {
  const values: FormValues = {};
  context?.fields.forEach(field => { if (field.name) values[field.name] = field.getValue(); });
  return values;
}
