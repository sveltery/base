<script lang="ts">
  // Source-ordered Base UI v1.8.0 Separator.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import type { SeparatorProps, SeparatorState } from './types.js';
  let { class: classProp, render, orientation = 'horizontal', style, children, ref = $bindable(), ...elementProps }: SeparatorProps = $props();
  const state: SeparatorState = $derived({ orientation });
  const forwardedRef = {
    get current() { return ref ?? null; },
    set current(element: HTMLElement | null) { ref = element; },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state, ref: forwardedRef,
    props: [{ role: 'separator', 'aria-orientation': orientation }, elementProps],
  });
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
