// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { getContext } from 'svelte';
import type { TooltipStore } from './store/TooltipStore.svelte.js';
export const ROOT = Symbol('Tooltip.Root');
export const PORTAL = Symbol('Tooltip.Portal');
export function useTooltipRootContext(optional?: false): TooltipStore<unknown>;
export function useTooltipRootContext(optional: true): TooltipStore<unknown> | undefined;
export function useTooltipRootContext(optional = false): TooltipStore<unknown> | undefined {
  const context = getContext<TooltipStore<unknown> | undefined>(ROOT);
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI: TooltipRootContext is missing. Tooltip parts must be placed within <Tooltip.Root>.',
    );
  }
  return context;
}
export interface TooltipPortalContext {
  readonly keepMounted: boolean;
}
export function useTooltipPortalContext() {
  const context = getContext<TooltipPortalContext | undefined>(PORTAL);
  if (context === undefined) throw new Error('Base UI: <Tooltip.Portal> is missing.');
  return context;
}
