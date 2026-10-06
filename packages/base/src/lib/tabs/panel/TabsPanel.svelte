<script lang="ts">
  import { untrack } from 'svelte';
  // Source business body: Base UI v1.8.0 TabsPanel.tsx at 47b40521. MIT.
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useCompositeListItem } from '../../internals/composite/list/useCompositeListItem.svelte.js';
  import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';

  import { useId } from '@sveltery/utils/useId';
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
  const panelRef = $state({ current: null as HTMLElement | null });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    const unregister = listItem.attach(host);
    return untrack(() => {
      ref = host;
      panelRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          unregister();
          if (panelRef.current === host) panelRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      partState,
      { class: classProp, style },
      [
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
    ),
    [hostAttachmentKey]: attachHost,
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
  $effect(() => {
    const panelId = id,
      panelValue = value,
      isHidden = hidden,
      retain = keepMounted;
    if (panelId == null || (isHidden && !retain)) return;
    const owner = root;
    return untrack(() => owner.registerMountedTabPanel(panelValue, panelId));
  });
  const shouldRender = $derived(keepMounted || transition.mounted);
</script>

{#if shouldRender}
  {#if render}
    {@render render(mergedProps, partState, children)}
  {:else}
    <div {...mergedProps}>{@render children?.()}</div>
  {/if}
{/if}
