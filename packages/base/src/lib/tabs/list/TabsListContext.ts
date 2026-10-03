// Base UI v1.8.0 TabsListContext, native Svelte provided context. MIT.
import { getContext, setContext } from 'svelte';
export interface TabsListContext {
  readonly activateOnFocus: boolean;
  registerIndicatorUpdateListener(listener: () => void): () => void;
  registerTabResizeObserverElement(element: HTMLElement): () => void;
  readonly tabsListElement: HTMLElement | null;
}
const key = Symbol('base-ui-tabs-list');
export function setTabsListContext(value: TabsListContext) {
  setContext(key, value);
}
export function useTabsListContext() {
  const context = getContext<TabsListContext | undefined>(key);
  if (context === undefined)
    throw new Error(
      'Base UI: TabsListContext is missing. TabsList parts must be placed within <Tabs.List>.',
    );
  return context;
}
