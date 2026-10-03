// Base UI v1.8.0 SwitchRootContext with native Svelte context. MIT.
import { getContext, setContext } from 'svelte';
import type { SwitchRootState } from '../types.js';
const key = Symbol('base-ui-switch-root');
export function setSwitchRootContext(getState: () => SwitchRootState) {
  setContext(key, getState);
}
export function useSwitchRootContext(): () => SwitchRootState {
  const context = getContext<(() => SwitchRootState) | undefined>(key);
  if (context === undefined)
    throw new Error(
      'Base UI: SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.',
    );
  return context;
}
