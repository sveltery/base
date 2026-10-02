<script lang="ts">
  // Adapted from pinned MeterIndicator; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getMeterContext } from './context.js';
  import type { MeterIndicatorProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: MeterIndicatorProps = $props();
  const context = getMeterContext();
  const state = {};
  const internal = $derived({ style: `inset-inline-start:0;height:inherit;width:${context.percentageValue}%` });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });
</script>
<Element tag="div" {internal} props={resolved} {state} {render} {children} bind:ref />
