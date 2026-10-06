// Base UI v1.8.0 ToolbarRootContext; native Svelte context. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { ToolbarRootOrientation } from '../types.js';
export interface ToolbarRootContext {
  readonly disabled: boolean;
  readonly orientation: ToolbarRootOrientation;
}
const key = Symbol('base-ui-toolbar-root');
export function setToolbarRootContext(context: ToolbarRootContext) {
  setContext(key, context);
}
export function useToolbarRootContext(optional?: false): ToolbarRootContext;
export function useToolbarRootContext(optional: true): ToolbarRootContext | undefined;
export function useToolbarRootContext(optional = false) {
  const context = getContext<ToolbarRootContext | undefined>(key);
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.',
    );
  }
  return context;
}
