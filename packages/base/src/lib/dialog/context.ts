import { getContext } from 'svelte';
import type { DialogController } from './controller.svelte.js';
export const ROOT = Symbol('Dialog.Root');
export const PORTAL = Symbol('Dialog.Portal');
export function root(optional = false): DialogController {
  const value = getContext<DialogController>(ROOT);
  if (!value && !optional) throw new Error('Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.');
  return value;
}
export interface PortalFocusManager {
  node: HTMLElement;
  guards: Set<HTMLElement>;
  reference(): HTMLElement | null | undefined;
  setPreventReturnFocus(value: boolean): void;
  closeOnFocusOut(event: FocusEvent): void;
}
export interface PortalContext { readonly keepMounted: boolean; node: HTMLElement | null; focusManager: PortalFocusManager | null }
export function portal(): PortalContext {
  const value = getContext<PortalContext>(PORTAL);
  if (!value) throw new Error('Base UI: <Dialog.Portal> is missing.');
  return value;
}
