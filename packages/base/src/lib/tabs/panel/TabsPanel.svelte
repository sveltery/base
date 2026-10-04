<script lang="ts">
  // Source business body: Base UI v1.8.0 TabsPanel.tsx at 47b40521. MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useCompositeListItem } from '../../internals/composite/list/useCompositeListItem.svelte.js';
  import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
  import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
  import { useId } from '../../utils/useId.js';
  import { transitionStatusMapping } from '../../internals/stateAttributesMapping.js';
  import { useTabsRootContext } from '../root/TabsRootContext.js';
  import { tabsStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import * as TabsPanelDataAttributes from './TabsPanelDataAttributes.js';
  import type { TabsPanelProps, TabsPanelState } from '../types.js';
  let {
    class: classProp,
    value,
    render,
    keepMounted = false,
    style,
    ref = $bindable(),
    children,
    ...elementProps
  }: TabsPanelProps = $props();
  const root = useTabsRootContext();
  const nativeId = $props.id();
  const id = $derived(useId(undefined, 'base-ui', nativeId));
  const listItem = useCompositeListItem();
  const open = $derived(value === root.value);
  const transition = useTransitionStatus(() => open);
  const hidden = $derived(!transition.mounted);
  const correspondingTabId = $derived(root.getTabIdByPanelValue(value));
  const stateAttributesMapping = {
    ...tabsStateAttributesMapping,
    ...transitionStatusMapping,
  };
  const partState: TabsPanelState = $derived({
    hidden,
    orientation: root.orientation,
    tabActivationDirection: root.tabActivationDirection,
    transitionStatus: transition.transitionStatus,
  });
  const panelRef = { current: null as HTMLElement | null };
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(element: HTMLElement | null) {
      ref = element;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state: partState,
    ref: [forwardedRef, listItem.ref, panelRef],
    props: [
      {
        'aria-labelledby': correspondingTabId,
        hidden,
        id,
        role: 'tabpanel',
        tabindex: open ? 0 : -1,
        inert: !open,
        [TabsPanelDataAttributes.index]: listItem.index(),
      },
      elementProps,
    ],
    stateAttributesMapping,
  });
  useOpenChangeComplete({
    get open() {
      return open;
    },
    ref: panelRef,
    onComplete() {
      if (!open) transition.setMounted(false);
    },
  });
  useIsoLayoutEffect(
    () => {
      if (id == null || (hidden && !keepMounted)) return;
      return root.registerMountedTabPanel(value, id);
    },
    () => [hidden, keepMounted, value, id, root.registerMountedTabPanel],
  );
  const shouldRender = $derived(keepMounted || transition.mounted);
</script>
{#if shouldRender}
  <RenderElement tag="div" {componentProps} {params} {children} />
{/if}
