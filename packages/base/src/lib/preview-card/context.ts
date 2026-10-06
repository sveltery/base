// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { getContext } from 'svelte';
import type { PreviewCardStore } from './store/PreviewCardStore.svelte.js';
export const ROOT = Symbol('PreviewCard.Root');
export const PORTAL = Symbol('PreviewCard.Portal');
export function usePreviewCardRootContext(optional?: false): PreviewCardStore<unknown>;
export function usePreviewCardRootContext(optional: true): PreviewCardStore<unknown> | undefined;
export function usePreviewCardRootContext(optional = false): PreviewCardStore<unknown> | undefined {
  const context = getContext<PreviewCardStore<unknown> | undefined>(ROOT);
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI: PreviewCardRootContext is missing. PreviewCard parts must be placed within <PreviewCard.Root>.',
    );
  }
  return context;
}
export interface PreviewCardPortalContext {
  readonly keepMounted: boolean;
}
export function usePreviewCardPortalContext() {
  const context = getContext<PreviewCardPortalContext | undefined>(PORTAL);
  if (context === undefined) throw new Error('Base UI: <PreviewCard.Portal> is missing.');
  return context;
}
