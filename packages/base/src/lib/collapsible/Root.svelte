<script lang="ts">
  // Source composition from Base UI v1.8.0 CollapsibleRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { useCollapsibleRoot } from './root/useCollapsibleRoot.svelte.js';
  import { setCollapsibleContext } from './context.js';
  import { collapsibleStateAttributesMapping } from './root/stateAttributesMapping.js';
  import type { CollapsibleRootProps, CollapsibleRootChangeEventDetails } from './types.js';

  let { children, render, class: className, defaultOpen = false, disabled = false,
    onOpenChange: onOpenChangeProp, open, style, ref = $bindable(), ...elementProps }: CollapsibleRootProps = $props();
  const onOpenChange = useStableCallback((next: boolean, details: CollapsibleRootChangeEventDetails) => onOpenChangeProp?.(next, details));
  const nativeId = $props.id();
  const collapsible = useCollapsibleRoot(() => ({ open, defaultOpen, onOpenChange, disabled }), nativeId);
  const state = $derived({ open: collapsible.open, disabled: collapsible.disabled, transitionStatus: collapsible.transitionStatus });
  setCollapsibleContext({
    get open() { return collapsible.open; }, get disabled() { return collapsible.disabled; },
    get mounted() { return collapsible.mounted; }, get transitionStatus() { return collapsible.transitionStatus; },
    get state() { return state; }, get defaultPanelId() { return collapsible.defaultPanelId; },
    get panelId() { return collapsible.panelId; },
    handleTrigger: collapsible.handleTrigger, setMounted: collapsible.setMounted,
    setOpen: collapsible.setOpen, setPanelIdState: collapsible.setPanelIdState, onOpenChange,
  });
</script>
<RenderElement tag="div" componentProps={{ render, class: className, style }}
  params={{ state, props: elementProps, stateAttributesMapping: collapsibleStateAttributesMapping }}
  {children} bind:element={ref} />
