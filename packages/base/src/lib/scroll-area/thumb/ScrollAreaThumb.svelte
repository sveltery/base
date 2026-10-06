<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Base UI1.8.0 ScrollAreaThumb.tsx source context/render composition; MIT.
  import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext.js';
  import { useScrollAreaScrollbarContext } from '../scrollbar/ScrollAreaScrollbarContext.js';
  import type { ScrollAreaThumbProps, ScrollAreaThumbState } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ScrollAreaThumbProps = $props();
  const root = useScrollAreaRootContext();
  const getOrientation = useScrollAreaScrollbarContext();
  const orientation = $derived(getOrientation());
  const vertical = $derived(orientation === 'vertical');
  const state: ScrollAreaThumbState = $derived({
    scrolling: vertical ? root.scrollingY : root.scrollingX,
    orientation,
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    const hostOwner = vertical ? root.thumbYRef : root.thumbXRef;
    return untrack(() => {
      ref = host;
      hostOwner.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (hostOwner.current === host) hostOwner.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: classProp, style: style },
      [
        {
          onpointerdown: root.handlePointerDown,
          onpointermove: root.handlePointerMove,
          onpointerup: root.handlePointerUp,
          onpointercancel: root.handlePointerUp,
          style: {
            visibility: root.hasMeasuredScrollbar ? undefined : 'hidden',
            ...(vertical
              ? { height: 'var(--scroll-area-thumb-height)' }
              : { width: 'var(--scroll-area-thumb-width)' }),
          },
        },
        elementProps,
      ],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
