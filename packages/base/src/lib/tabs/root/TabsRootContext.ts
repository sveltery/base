// Base UI v1.8.0 TabsRootContext, native Svelte provided context. MIT.
import { getContext, setContext } from 'svelte';
import type { CompositeMetadata } from '../../internals/composite/list/CompositeListContext.js';
import type {
  TabsRootChangeEventDetails,
  TabsRootOrientation,
  TabsTabValue,
  TabsTabActivationDirection,
} from '../types.js';
export interface TabsRootContext {
  readonly value: TabsTabValue;
  onValueChange(value: TabsTabValue, details: TabsRootChangeEventDetails): void;
  readonly orientation: TabsRootOrientation;
  getTabElementBySelectedValue(value: TabsTabValue): HTMLElement | null;
  getTabIdByPanelValue(value: TabsTabValue): string | undefined;
  getTabPanelIdByValue(value: TabsTabValue): string | undefined;
  registerMountedTabPanel(value: TabsTabValue, id: string): () => void;
  setTabMap(map: Map<Element, CompositeMetadata>): void;
  readonly tabActivationDirection: TabsTabActivationDirection;
}
const key = Symbol('base-ui-tabs-root');
export function setTabsRootContext(value: TabsRootContext) {
  setContext(key, value);
}
export function useTabsRootContext() {
  const context = getContext<TabsRootContext | undefined>(key);
  if (context === undefined)
    throw new Error(
      'Base UI: TabsRootContext is missing. Tabs parts must be placed within <Tabs.Root>.',
    );
  return context;
}
