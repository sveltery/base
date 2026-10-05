// Base UI v1.8.0 ToolbarGroupContext; native Svelte context. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
export interface ToolbarGroupContext {
  readonly disabled: boolean;
}
const key = Symbol('base-ui-toolbar-group');
export function setToolbarGroupContext(context: ToolbarGroupContext) {
  setContext(key, context);
}
export function useToolbarGroupContext() {
  return getContext<ToolbarGroupContext | undefined>(key);
}
