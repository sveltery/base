// Base UI v1.8.0 CheckboxRootContext, native Svelte context. MIT.
import { getContext, setContext } from 'svelte';
import type { CheckboxRootState } from '../types.js';
const key = Symbol('base-ui-checkbox-root');
export function setCheckboxRootContext(getState: () => CheckboxRootState) { setContext(key, getState); }
export function useCheckboxRootContext(): () => CheckboxRootState {
  const context = getContext<(() => CheckboxRootState) | undefined>(key);
  if (context === undefined) throw new Error('Base UI: CheckboxRootContext is missing. Checkbox parts must be placed within <Checkbox.Root>.');
  return context;
}
