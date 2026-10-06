<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original DialogViewport rendering/ref/state/keep-mounted business body (MIT).
  import { useDialogPortalContext, useDialogRootContext } from './context.js';
  import { dialogStateAttributesMapping } from './utils/stateAttributesMapping.js';
  import type { DialogViewportProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    ref = $bindable(),
    ...elementProps
  }: DialogViewportProps = $props();
  const portal = useDialogPortalContext();
  const store = useDialogRootContext();
  const state = $derived({
    open: store.select('open'),
    nested: store.select('nested'),
    transitionStatus: store.select('transitionStatus'),
    nestedDialogOpen: store.select('nestedOpenDialogCount') > 0,
  });
  const setViewportElement = store.useStateSetter('viewportElement');

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      setViewportElement?.(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          setViewportElement?.(null);
        });
    });
  }
  const renderEnabled = $derived(portal.keepMounted || store.select('mounted'));
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [
        {
          role: 'presentation',
          hidden: !store.select('mounted'),
          style: { pointerEvents: !state.open ? 'none' : undefined },
        },
        elementProps,
      ],
      dialogStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if renderEnabled}
  {#if render}
    {@render render(mergedProps, state, children)}
  {:else}
    <div {...mergedProps}>{@render children?.()}</div>
  {/if}
{/if}
