// Original DialogRoot/Portal required and optional context reads using native Svelte context (MIT).
import { getContext } from 'svelte';
import type { DialogStore } from './store/DialogStore.svelte.js';
export const ROOT = Symbol('Dialog.Root');
export const PORTAL = Symbol('Dialog.Portal');
export function useDialogRootContext(optional?: false): DialogStore<unknown>;
export function useDialogRootContext(optional: true): DialogStore<unknown> | undefined;
export function useDialogRootContext(optional = false): DialogStore<unknown> | undefined {
  const store = getContext<DialogStore<unknown> | undefined>(ROOT);
  if (!store && !optional)
    throw new Error(
      'Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.',
    );
  return store;
}
export interface PortalContext {
  readonly keepMounted: boolean;
}
export function useDialogPortalContext() {
  const value = getContext<PortalContext | undefined>(PORTAL);
  if (!value) throw new Error('Base UI: <Dialog.Portal> is missing.');
  return value;
}
