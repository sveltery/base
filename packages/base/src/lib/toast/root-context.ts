import { createContext } from 'svelte';
import type { ToastObject } from './types.js';

const [getRootContext, setRootContext, hasRootContext] = createContext<ToastRootContext>();
export { setRootContext };
export interface ToastRootContext {
  readonly toast: ToastObject;
  readonly expanded: boolean;
  readonly visibleIndex: number;
  readonly titleId: string | undefined;
  readonly descriptionId: string | undefined;
  setTitleId(id?: string): () => void;
  setDescriptionId(id?: string): () => void;
  recalculateHeight(flush?: boolean): void;
}
export function root(): ToastRootContext {
  const value = hasRootContext() ? getRootContext() : undefined;
  if (!value)
    throw new Error(
      'Base UI: ToastRootContext is missing. Toast parts must be used within <Toast.Root>.',
    );
  return value;
}
