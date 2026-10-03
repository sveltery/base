// Base UI v1.8.0 RadioRootContext, native Svelte context. MIT.
import { getContext, setContext } from 'svelte';
import type { RadioRootState } from '../types.js';
const key = Symbol('base-ui-radio-root');
export function setRadioRootContext(value: () => RadioRootState) {
  setContext(key, value);
}
export function useRadioRootContext() {
  const context = getContext<(() => RadioRootState) | undefined>(key);
  if (!context)
    throw new Error(
      'Base UI: RadioRootContext is missing. Radio parts must be placed within <Radio.Root>.',
    );
  return context;
}
