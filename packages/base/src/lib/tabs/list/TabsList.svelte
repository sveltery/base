<script lang="ts">
  // Source business body: Base UI v1.8.0 TabsList.tsx at 47b40521. MIT.
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import CompositeRoot from '../../internals/composite/root/CompositeRoot.svelte';
  import { EMPTY_ARRAY } from '@sveltery/utils/empty';
  import { useTabsRootContext } from '../root/TabsRootContext.js';
  import { tabsStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import { setTabsListContext } from './TabsListContext.js';
  import type { TabsListProps, TabsListState } from '../types.js';
  let {
    activateOnFocus = false,
    class: classProp,
    loopFocus = true,
    render,
    style,
    ref = $bindable(),
    children,
    ...elementProps
  }: TabsListProps = $props();
  const root = useTabsRootContext();
  let highlightedTabIndex = $state(0);
  let tabsListElement = $state<HTMLElement | null>(null);
  const indicatorUpdateListenersRef = { current: new Set<() => void>() };
  const tabResizeObserverElementsRef = { current: new Set<HTMLElement>() };
  const resizeObserverRef = { current: null as ResizeObserver | null };
  $effect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const element = tabsListElement;
    const resizeObserver = new ResizeObserver(() =>
      indicatorUpdateListenersRef.current.forEach((listener) => listener()),
    );
    resizeObserverRef.current = resizeObserver;
    if (element) resizeObserver.observe(element);
    tabResizeObserverElementsRef.current.forEach((element) => resizeObserver.observe(element));
    return () => {
      resizeObserver.disconnect();
      resizeObserverRef.current = null;
    };
  });
  function registerIndicatorUpdateListener(listener: () => void) {
    indicatorUpdateListenersRef.current.add(listener);
    return () => {
      indicatorUpdateListenersRef.current.delete(listener);
    };
  }
  function registerTabResizeObserverElement(element: HTMLElement) {
    tabResizeObserverElementsRef.current.add(element);
    resizeObserverRef.current?.observe(element);
    return () => {
      tabResizeObserverElementsRef.current.delete(element);
      resizeObserverRef.current?.unobserve(element);
    };
  }
  setTabsListContext({
    get activateOnFocus() {
      return activateOnFocus;
    },
    registerIndicatorUpdateListener,
    registerTabResizeObserverElement,
    get tabsListElement() {
      return tabsListElement;
    },
  });
  const partState: TabsListState = $derived({
    orientation: root.orientation,
    tabActivationDirection: root.tabActivationDirection,
  });
  const defaultProps = $derived({
    'aria-orientation': root.orientation === 'vertical' ? 'vertical' : undefined,
    role: 'tablist',
  });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      tabsListElement = host;
      return () =>
        untrack(() => {
          if (tabsListElement === host) tabsListElement = null;
        });
    });
  }
</script>

<CompositeRoot
  {render}
  class={classProp}
  {style}
  state={partState}
  bind:ref
  props={[defaultProps, elementProps, { [hostAttachmentKey]: attachHost }]}
  stateAttributesMapping={tabsStateAttributesMapping}
  highlightedIndex={highlightedTabIndex}
  enableHomeAndEndKeys
  {loopFocus}
  orientation={root.orientation}
  onHighlightedIndexChange={(index) => {
    highlightedTabIndex = index;
  }}
  onMapChange={root.setTabMap}
  disabledIndices={EMPTY_ARRAY}
  {children}
/>
