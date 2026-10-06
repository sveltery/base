// Base UI v1.8.0 RadioGroupContext, native Svelte context. MIT.
import { getContext, setContext } from 'svelte';
import type { UseFieldValidationReturnValue } from '../field/root/useFieldValidation.svelte.js';
import type { RadioGroupChangeEventDetails } from './types.js';
export interface RadioGroupContext<Value> {
  readonly disabled: boolean | undefined;
  readonly readOnly: boolean | undefined;
  readonly required: boolean | undefined;
  readonly form: string | undefined;
  readonly name: string | undefined;
  readonly checkedValue: Value | undefined;
  setCheckedValue(value: Value, details: RadioGroupChangeEventDetails): void;
  readonly touched: boolean;
  setTouched(value: boolean): void;
  validation?: UseFieldValidationReturnValue;
  registerInputRef(element: HTMLInputElement | null): void | (() => void);
}
const key = Symbol('base-ui-radio-group');
export function setRadioGroupContext<Value>(value: RadioGroupContext<Value>) {
  setContext(key, value);
}
export function useRadioGroupContext<Value>(): RadioGroupContext<Value> | undefined {
  return getContext<RadioGroupContext<Value> | undefined>(key);
}
