<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original DialogBackdrop rendering/ref/state branches (MIT).
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogBackdropProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    forceRender = false,
    ref = $bindable(),
    ...elementProps
  }: DialogBackdropProps = $props();
  const store = useDialogRootContext();
  const state = $derived({
    open: store.select('open'),
    transitionStatus: store.select('transitionStatus'),
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      store.context.backdropRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (store.context.backdropRef.current === host) store.context.backdropRef.current = null;
        });
    });
  }
  const renderEnabled = $derived(forceRender || !store.select('nested'));
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [
        {
          role: 'presentation',
          hidden: !store.select('mounted'),
          style: { userSelect: 'none', WebkitUserSelect: 'none' },
        },
        elementProps,
      ],
      popupTransitionStateMapping,
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
