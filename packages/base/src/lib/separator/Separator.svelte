<script lang="ts">
  // Adapted from mui/base-ui v1.8.0 Separator; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import type { SeparatorProps } from './types.js';
  let { children, render, orientation = 'horizontal', ref = $bindable(), ...props }: SeparatorProps = $props();
  const state = $derived({ orientation });
  const internal = $derived({ role: 'separator', 'aria-orientation': orientation, 'data-orientation': orientation });
</script>
<Element tag="div" {internal} {props} {state} {render} {children} bind:ref />
