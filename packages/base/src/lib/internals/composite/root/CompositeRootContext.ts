// Base UI v1.8.0 CompositeRootContext, native Svelte context. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
export interface CompositeRootContext {
  readonly highlightedIndex: number;
  onHighlightedIndexChange(index: number, shouldScrollIntoView?: boolean): void;
  readonly highlightItemOnHover: boolean;
  relayKeyboardEvent(event: KeyboardEvent): void;
}
const key = Symbol('base-ui-composite-root');
export function setCompositeRootContext(value: CompositeRootContext) {
  setContext(key, value);
}
export function useCompositeRootContext(
  optional: true,
): CompositeRootContext | undefined;
export function useCompositeRootContext(optional?: false): CompositeRootContext;
export function useCompositeRootContext(optional = false) {
  const context = getContext<CompositeRootContext | undefined>(key);
  if (context === undefined && !optional)
    throw new Error(
      'Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>.',
    );
  return context;
}
