// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { getContext } from 'svelte';
import type { PopoverStore } from './store/PopoverStore.svelte.js';
export const ROOT = Symbol('Popover.Root');
export const PORTAL = Symbol('Popover.Portal');
export function usePopoverRootContext(optional?: false): PopoverStore<unknown>;
export function usePopoverRootContext(optional: true): PopoverStore<unknown> | undefined;
export function usePopoverRootContext(optional = false): PopoverStore<unknown> | undefined {
  const context = getContext<PopoverStore<unknown> | undefined>(ROOT);
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI: PopoverRootContext is missing. Popover parts must be placed within <Popover.Root>.',
    );
  }
  return context;
}
export interface PopoverPortalContext {
  readonly keepMounted: boolean;
}
export function usePopoverPortalContext() {
  const context = getContext<PopoverPortalContext | undefined>(PORTAL);
  if (context === undefined) throw new Error('Base UI: <Popover.Portal> is missing.');
  return context;
}
