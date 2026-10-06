<script lang="ts">
  // Source composition from Base UI v1.8.0 CollapsiblePanel.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { DEV } from 'esm-env';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { warn } from '@sveltery/utils/warn';
  import { getCollapsibleContext } from './context.js';
  import { collapsibleStateAttributesMapping } from './root/stateAttributesMapping.js';
  import { CollapsiblePanel } from './panel/useCollapsiblePanel.svelte.js';
  import * as CollapsiblePanelCssVars from './panel/CollapsiblePanelCssVars.js';
  import type { CollapsiblePanelProps } from './types.js';

  let {
    children,
    class: className,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    render,
    id: idProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: CollapsiblePanelProps = $props();
  if (DEV)
    $effect(() => {
      if (hiddenUntilFoundProp && keepMountedProp === false)
        warn(
          'The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.',
        );
    });
  const context = getCollapsibleContext();
  const hiddenUntilFound = $derived(hiddenUntilFoundProp ?? false);
  const keepMounted = $derived(keepMountedProp ?? false);
  const registeredId = $derived(idProp || undefined);
  const id = $derived(registeredId ?? context.defaultPanelId);
  $effect(() => {
    const registered = registeredId;
    untrack(() =>
      context.setPanelIdState(
        (currentId) => registered ?? (currentId === null ? undefined : currentId),
      ),
    );
    return () =>
      untrack(() =>
        context.setPanelIdState((currentId) => (currentId === registered ? null : currentId)),
      );
  });
  const panel = new CollapsiblePanel({
    get hiddenUntilFound() {
      return hiddenUntilFound;
    },
    get id() {
      return id;
    },
    get keepMounted() {
      return keepMounted;
    },
    get mounted() {
      return context.mounted;
    },
    onOpenChange: context.onOpenChange,
    get open() {
      return context.open;
    },
    setMounted: context.setMounted,
    setOpen: context.setOpen,
    get transitionStatus() {
      return context.transitionStatus;
    },
  });
  const panelState = $derived({ ...context.state, transitionStatus: panel.transitionStatus });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const dispose = panel.attach(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          dispose();
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const props = mergeComponentProps(
      panelState,
      { class: className, style },
      [
        panel.props,
        {
          style: {
            [CollapsiblePanelCssVars.collapsiblePanelHeight]:
              panel.height === undefined ? 'auto' : `${panel.height}px`,
            [CollapsiblePanelCssVars.collapsiblePanelWidth]:
              panel.width === undefined ? 'auto' : `${panel.width}px`,
          },
        },
        elementProps,
      ],
      collapsibleStateAttributesMapping,
    );
    if (panel.shouldPreventOpenAnimation) props.style = `${props.style ?? ''};animation-name:none`;
    if (panel.skippedMotion)
      props.style = `${props.style ?? ''};${panel.skippedMotion === 'css-transition' ? 'transition-duration' : 'animation-duration'}:0s`;
    return { ...props, [hostAttachmentKey]: attachHost };
  });
</script>

{#if panel.shouldRender}
  {#if render}
    {@render render(mergedProps, panelState, children)}
  {:else}
    <div {...mergedProps}>{@render children?.()}</div>
  {/if}
{/if}
