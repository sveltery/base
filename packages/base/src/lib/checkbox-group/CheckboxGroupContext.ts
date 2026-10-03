// Base UI v1.8.0 CheckboxGroupContext native Svelte context. MIT.
import { getContext, setContext } from 'svelte';
import type { UseFieldValidationReturnValue } from '../field/root/useFieldValidation.svelte.js';
import type { UseCheckboxGroupParentReturnValue } from './useCheckboxGroupParent.svelte.js';
import type { LabelableContext } from '../internals/labelable-provider/LabelableContext.js';
import type { CheckboxGroupChangeEventDetails } from './types.js';
export interface CheckboxGroupContext {
  readonly value: string[];
  setValue(value: string[], details: CheckboxGroupChangeEventDetails): void;
  readonly allValues: string[] | undefined;
  parent: UseCheckboxGroupParentReturnValue;
  readonly disabled: boolean;
  validation: UseFieldValidationReturnValue;
  registerControlId: LabelableContext['registerControlId'];
}
const key = Symbol('base-ui-checkbox-group');
export function setCheckboxGroupContext(context: CheckboxGroupContext) {
  setContext(key, context);
}
export function useCheckboxGroupContext(): CheckboxGroupContext | undefined {
  return getContext<CheckboxGroupContext | undefined>(key);
}
