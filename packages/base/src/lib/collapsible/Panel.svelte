<script lang="ts">
  // Source composition from Base UI v1.8.0 CollapsiblePanel.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { DEV } from 'esm-env';
  import { createAttachmentKey } from 'svelte/attachments';
  import RenderElement from '../internals/RenderElement.svelte';
  import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
  import { warn } from '../utils/warn.js';
  import { resolveStyle } from '../utils/resolveStyle.js';
  import { getCollapsibleContext } from './context.js';
  import { collapsibleStateAttributesMapping } from './root/stateAttributesMapping.js';
  import { useCollapsiblePanel } from './panel/useCollapsiblePanel.svelte.js';
  import { useCollapsiblePanelDimensions } from './panel/useCollapsiblePanelDimensions.svelte.js';
  import * as CollapsiblePanelCssVars from './panel/CollapsiblePanelCssVars.js';
  import type { CollapsiblePanelProps } from './types.js';

  let { children, class: className, hiddenUntilFound: hiddenUntilFoundProp, keepMounted: keepMountedProp,
    render, id: idProp, style, ref = $bindable(), ...elementProps }: CollapsiblePanelProps = $props();
  if (DEV) $effect(() => {
    if (hiddenUntilFoundProp && keepMountedProp === false) warn(
      'The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.',
    );
  });
  const context = getCollapsibleContext();
  const hiddenUntilFound = $derived(hiddenUntilFoundProp ?? false);
  const keepMounted = $derived(keepMountedProp ?? false);
  const registeredId = $derived(idProp || undefined);
  const id = $derived(registeredId ?? context.defaultPanelId);
  useIsoLayoutEffect(() => {
    const registered = registeredId;
    context.setPanelIdState(currentId => registered ?? (currentId === null ? undefined : currentId));
    return () => context.setPanelIdState(currentId => currentId === registered ? null : currentId);
  }, () => [registeredId, context.setPanelIdState]);
  const panel = useCollapsiblePanel({
    get hiddenUntilFound() { return hiddenUntilFound; }, get id() { return id; },
    get keepMounted() { return keepMounted; }, get mounted() { return context.mounted; },
    onOpenChange: context.onOpenChange, get open() { return context.open; },
    setMounted: context.setMounted, setOpen: context.setOpen,
    get transitionStatus() { return context.transitionStatus; },
  });
  const panelState = $derived({ ...context.state, transitionStatus: panel.transitionStatus });
  const resolvedStyle = $derived(resolveStyle(style, panelState));
  const dimensionsAttachmentKey = createAttachmentKey();
  const dimensionsAttachment = useCollapsiblePanelDimensions(() => ({
    height: panel.height, width: panel.width, style: resolvedStyle,
  }));
</script>
{#if panel.shouldRender}
  <RenderElement tag="div" componentProps={{ render, class: className }} params={{
    state: panelState, ref: panel.ref,
    props: [panel.props, {
      style: {
        [CollapsiblePanelCssVars.collapsiblePanelHeight]: 'auto',
        [CollapsiblePanelCssVars.collapsiblePanelWidth]: 'auto',
      },
      [dimensionsAttachmentKey]: dimensionsAttachment,
    }, elementProps, resolvedStyle ? { style: resolvedStyle } : undefined,
    panel.shouldPreventOpenAnimation ? { style: { animationName: 'none' } } : undefined],
    stateAttributesMapping: collapsibleStateAttributesMapping,
  }} {children} bind:element={ref} />
{/if}
