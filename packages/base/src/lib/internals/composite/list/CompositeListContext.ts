// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md; parity/radio/source-correspondence.md.
import { getContext, setContext } from 'svelte';
export type CompositeMetadata = { index: number } & Record<string, unknown>;
export interface CompositeListRegistration {
  metadata: Record<string, unknown> | null;
  index: number | null;
  label: string | null | undefined;
  textRef: { current: HTMLElement | null } | undefined;
}
export interface CompositeListContextValue {
  register(node: Element, registration: CompositeListRegistration): void;
  unregister(node: Element): void;
  subscribeMapChange(
    fn: (map: Map<Element, CompositeMetadata>) => void,
  ): () => void;
  nextIndexRef: { current: number };
}
const key = Symbol('base-ui-composite-list');
const fallback: CompositeListContextValue = {
  register() {},
  unregister() {},
  subscribeMapChange: () => () => {},
  nextIndexRef: { current: 0 },
};
export function setCompositeListContext(value: CompositeListContextValue) {
  setContext(key, value);
}
export function useCompositeListContext() {
  return getContext<CompositeListContextValue | undefined>(key) ?? fallback;
}
