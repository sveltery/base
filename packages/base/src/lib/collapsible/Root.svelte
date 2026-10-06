<script lang="ts">
  // Source composition from Base UI v1.8.0 CollapsibleRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import { CollapsibleRoot } from './root/useCollapsibleRoot.svelte.js';
  import { setCollapsibleContext } from './context.js';
  import { collapsibleStateAttributesMapping } from './root/stateAttributesMapping.js';
  import type { CollapsibleRootProps, CollapsibleRootChangeEventDetails } from './types.js';

  let {
    children,
    render,
    class: className,
    defaultOpen = false,
    disabled = false,
    onOpenChange: onOpenChangeProp,
    open,
    style,
    ref = $bindable(),
    ...elementProps
  }: CollapsibleRootProps = $props();
  const onOpenChange = (next: boolean, details: CollapsibleRootChangeEventDetails) =>
    onOpenChangeProp?.(next, details);
  const nativeId = $props.id();
  const collapsible = new CollapsibleRoot(
    () => ({ open, defaultOpen, onOpenChange, disabled }),
    nativeId,
  );
  const state = $derived({
    open: collapsible.open,
    disabled: collapsible.disabled,
    transitionStatus: collapsible.transitionStatus,
  });
  setCollapsibleContext({
    get open() {
      return collapsible.open;
    },
    get disabled() {
      return collapsible.disabled;
    },
    get mounted() {
      return collapsible.mounted;
    },
    get transitionStatus() {
      return collapsible.transitionStatus;
    },
    get state() {
      return state;
    },
    get defaultPanelId() {
      return collapsible.defaultPanelId;
    },
    get panelId() {
      return collapsible.panelId;
    },
    handleTrigger: collapsible.handleTrigger,
    setMounted: collapsible.setMounted,
    setOpen: collapsible.setOpen,
    setPanelIdState: collapsible.setPanelIdState,
    onOpenChange,
  });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style },
      elementProps,
      collapsibleStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
