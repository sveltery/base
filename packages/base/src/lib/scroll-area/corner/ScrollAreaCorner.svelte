<script lang="ts">
  // Base UI1.8.0 ScrollAreaCorner.tsx source context/render composition; MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext.js';
  import type { ScrollAreaCornerProps } from '../types.js';
  let { render, class: classProp, style, children, ref = $bindable(), ...elementProps }: ScrollAreaCornerProps = $props();
  const root = useScrollAreaRootContext();
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ ref: [forwardedRef, root.cornerRef], props: [{ 'aria-hidden': true, style: { position: 'absolute', bottom: 0, insetInlineEnd: 0, width: root.cornerSize.width, height: root.cornerSize.height } }, elementProps] });
</script>
{#if !root.hiddenState.corner}<RenderElement tag="div" {componentProps} {params} {children} />{/if}
