<script lang="ts">
  // Base UI v1.8.0 SwitchThumb.tsx, native Svelte renderer/context. MIT.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useSwitchRootContext } from '../root/SwitchRootContext.js';
  import { stateAttributesMapping } from '../stateAttributesMapping.js';
  import type { SwitchThumbProps } from '../types.js';
  let { render, class: classProp, style, children, ref = $bindable(), ...elementProps }: SwitchThumbProps = $props();
  const getState = useSwitchRootContext();
  const state = $derived(getState());
  const forwardedRef = { get current() { return ref ?? null; }, set current(element: HTMLSpanElement | null) { ref = element; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ state, ref: forwardedRef, props: elementProps, stateAttributesMapping });
</script>
<RenderElement tag="span" {componentProps} {params} {children} />
