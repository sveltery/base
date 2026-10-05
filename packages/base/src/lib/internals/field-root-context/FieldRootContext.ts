// Ported from Base UI v1.8.0 internals/field-root-context/FieldRootContext.ts.
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { EMPTY_OBJECT, NOOP } from '@sveltery/utils/empty';
import { DEFAULT_FIELD_ROOT_STATE, DEFAULT_VALIDITY_STATE } from '../field-constants/constants.js';
import type { FieldValidityData, FieldRootState } from '../../field/types.js';
import type { FormValidationMode } from '../../form/types.js';
import type { UseFieldValidationReturnValue } from '../../field/root/useFieldValidation.svelte.js';
import type { FieldControlRegistration } from '../field-register-control/useFieldControlRegistration.svelte.js';
export interface FieldRootContext {
  readonly invalid: boolean | undefined;
  readonly name: string | undefined;
  readonly validityData: FieldValidityData;
  setValidityData(data: FieldValidityData | ((previous: FieldValidityData) => FieldValidityData)): void;
  readonly disabled: boolean | undefined;
  setTouched(value: boolean): void;
  setDirty(value: boolean): void;
  setFilled(value: boolean): void;
  setFocused(value: boolean): void;
  readonly validationMode: FormValidationMode;
  shouldValidateOnChange(): boolean;
  readonly state: FieldRootState;
  registerFieldControl(source: symbol, registration: FieldControlRegistration | undefined): void;
  validation: UseFieldValidationReturnValue;
}
export const DEFAULT_FIELD_ROOT_CONTEXT: FieldRootContext = {
  invalid: undefined, name: undefined,
  validityData: { state: DEFAULT_VALIDITY_STATE, errors: [], error: '', value: '', initialValue: null },
  setValidityData: NOOP, disabled: undefined,
  setTouched: NOOP, setDirty: NOOP, setFilled: NOOP, setFocused: NOOP,
  validationMode: 'onSubmit', shouldValidateOnChange: () => false,
  state: DEFAULT_FIELD_ROOT_STATE, registerFieldControl: NOOP,
  validation: {
    getValidationProps: (_disabled, props = EMPTY_OBJECT) => props,
    inputRef: { current: null }, registeredInputs: new Map(), registerInput: NOOP,
    getInputControl: () => null, commit: async () => {}, change: NOOP,
  },
};
const fieldRootKey = Symbol('base-ui-field');
export function setFieldRootContext(value: FieldRootContext) { setContext(fieldRootKey, value); }
export function useFieldRootContext(optional = true): FieldRootContext {
  const context = getContext<FieldRootContext | undefined>(fieldRootKey) ?? DEFAULT_FIELD_ROOT_CONTEXT;
  if (context.setValidityData === NOOP && !optional) {
    throw new Error('Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.');
  }
  return context;
}
