// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
import { getContext } from 'svelte';
import type { ToastStore } from './store.js';
import type { ToastManagerFacade } from './types.js';

export const PROVIDER = Symbol('Toast.Provider');
export interface ToastProviderContext {
  readonly store: ToastStore;
  readonly manager: ToastManagerFacade;
}

export function provider(): ToastProviderContext {
  const context = getContext<ToastProviderContext | undefined>(PROVIDER);
  if (!context) {
    throw new Error('Base UI: getToastManager must be used within <Toast.Provider>.');
  }
  return context;
}
