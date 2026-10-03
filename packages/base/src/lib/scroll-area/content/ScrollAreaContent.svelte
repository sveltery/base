<script lang="ts">
  // Base UI1.8.0 ScrollAreaContent.tsx source observer composition; MIT.
  import { untrack } from 'svelte';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useScrollAreaViewportContext } from '../viewport/ScrollAreaViewportContext.js';
  import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext.js';
  import { scrollAreaStateAttributesMapping } from '../root/stateAttributes.js';
  import type { ScrollAreaContentProps } from '../types.js';
  let { render, class: classProp, style, children, ref = $bindable(), ...elementProps }: ScrollAreaContentProps = $props();
  const { computeThumbPosition } = useScrollAreaViewportContext();
  const root = useScrollAreaRootContext();
  const contentWrapperRef = $state<{ current: HTMLElement | null }>({ current: null });
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
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ ref: [forwardedRef, contentWrapperRef], state: root.viewportState, stateAttributesMapping: scrollAreaStateAttributesMapping, props: [{ role: 'presentation', style: { minWidth: 'fit-content' } }, elementProps] });
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
