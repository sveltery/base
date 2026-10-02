// Base UI v1.8.0 Field context adaptation; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { FieldRootState, FieldValidityData } from './types.js';
import type { FormValidationMode } from '../form/types.js';
export interface ControlRegistration {
  id: string; name: string | undefined; value: string | undefined;
  control: HTMLElement; getValue(): unknown;
}
export interface FieldContext {
  readonly state: FieldRootState;
  readonly name: string | undefined;
  readonly invalid: boolean;
  readonly validityData: FieldValidityData;
  readonly combinedValidityData: FieldValidityData;
  readonly formError: string | string[] | null;
  readonly validationMode: FormValidationMode;
  readonly input: HTMLInputElement | null;
  setInput(input: HTMLInputElement | null): void;
  setTouched(value: boolean): void;
  setDirty(value: boolean): void;
  setFilled(value: boolean): void;
  setFocused(value: boolean): void;
  registerControl(source: symbol, registration: ControlRegistration | undefined): void;
  validate(): void;
  change(value: unknown, cancelPending?: boolean): void;
  commit(value: unknown): Promise<void>;
}
const fieldKey = Symbol('base-ui-field');
const itemKey = Symbol('base-ui-field-item');
export function setFieldContext(value: FieldContext) { setContext(fieldKey, value); }
export function getFieldContext(optional = true): FieldContext | undefined {
  const value = getContext<FieldContext | undefined>(fieldKey);
  if (!value && !optional) throw new Error('Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.');
  return value;
}
export function setFieldItemContext(value: { readonly disabled: boolean }) { setContext(itemKey, value); }
export function getFieldItemContext(): { readonly disabled: boolean } | undefined { return getContext(itemKey); }
