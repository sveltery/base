<script lang="ts">
  // Base UI1.8.0 ScrollAreaThumb.tsx source context/render composition; MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
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
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    ref: [forwardedRef, vertical ? root.thumbYRef : root.thumbXRef],
    state,
    props: [
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
  });
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
