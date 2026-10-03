// Existing Field parts share the canonical source contexts through this import facade.
// Base UI v1.8.0; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { useFieldRootContext, setFieldRootContext, type FieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
import { useFormContext } from '../internals/form-context/FormContext.js';
import { getCombinedFieldValidityData } from './utils/getCombinedFieldValidityData.js';
import type { FieldValidityData } from './types.js';
export interface FieldContext extends FieldRootContext {
  readonly combinedValidityData: FieldValidityData;
  readonly formError: string | string[] | null;
  readonly input: HTMLInputElement | null;
  setInput(input: HTMLInputElement | null): void;
  change(value: unknown, cancelPending?: boolean): void;
  commit(value: unknown): Promise<void>;
}
const itemKey = Symbol('base-ui-field-item');
export const setFieldContext = setFieldRootContext;
export function getFieldContext(optional = true): FieldContext {
  const source = useFieldRootContext(optional);
  const form = useFormContext();
  return {
    get state() { return source.state; }, get name() { return source.name; },
    get invalid() { return source.invalid; }, get disabled() { return source.disabled; },
    get validityData() { return source.validityData; },
    get combinedValidityData() { return getCombinedFieldValidityData(source.validityData, source.invalid); },
    get formError() { const name = source.name; return name && Object.hasOwn(form.errors, name) ? form.errors[name] : null; },
    get validationMode() { return source.validationMode; },
    get input() { return source.validation.inputRef.current; },
    setInput(input) { source.validation.inputRef.current = input; },
    setValidityData: source.setValidityData,
    setTouched: source.setTouched, setDirty: source.setDirty, setFilled: source.setFilled, setFocused: source.setFocused,
    shouldValidateOnChange: source.shouldValidateOnChange,
    registerFieldControl: source.registerFieldControl, validation: source.validation,
    change: source.validation.change, commit: source.validation.commit,
  };
}
export function setFieldItemContext(value: { readonly disabled: boolean }) { setContext(itemKey, value); }
export function getFieldItemContext(): { readonly disabled: boolean } | undefined { return getContext(itemKey); }
