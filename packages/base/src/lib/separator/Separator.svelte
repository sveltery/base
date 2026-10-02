<script lang="ts">
  // Adapted from mui/base-ui v1.8.0 Separator; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import type { SeparatorProps } from './types.js';
  let { children, render, orientation = 'horizontal', class: classProp, ref = $bindable(), ...props }: SeparatorProps = $props();
  const state = $derived({ orientation });
  const internal = $derived({ role: 'separator', 'aria-orientation': orientation, 'data-orientation': orientation });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });
</script>
<Element tag="div" {internal} props={resolved} {state} {render} {children} bind:ref />
