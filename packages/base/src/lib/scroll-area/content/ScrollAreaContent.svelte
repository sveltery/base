<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Base UI1.8.0 ScrollAreaContent.tsx source observer composition; MIT.
  import { untrack } from 'svelte';
  import { useScrollAreaViewportContext } from '../viewport/ScrollAreaViewportContext.js';
  import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext.js';
  import { scrollAreaStateAttributesMapping } from '../root/stateAttributes.js';
  import type { ScrollAreaContentProps } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ScrollAreaContentProps = $props();
  const { computeThumbPosition } = useScrollAreaViewportContext();
  const root = useScrollAreaRootContext();
  const contentWrapperRef = $state<{ current: HTMLElement | null }>({
    current: null,
  });
  const computeOnInitialResize = untrack(() => root.hasMeasuredScrollbar);
  $effect(() => {
    const content = contentWrapperRef.current;
    if (typeof ResizeObserver === 'undefined') return;
    let hasInitialized = false;
    const resizeObserver = new ResizeObserver(() => {
      if (!hasInitialized) {
        hasInitialized = true;
        if (!computeOnInitialResize) return;
      }
      computeThumbPosition();
    });
    if (content) resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      contentWrapperRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (contentWrapperRef.current === host)
            contentWrapperRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      root.viewportState,
      { class: classProp, style: style },
      [
        { role: 'presentation', style: { minWidth: 'fit-content' } },
        elementProps,
      ],
      scrollAreaStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, root.viewportState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
