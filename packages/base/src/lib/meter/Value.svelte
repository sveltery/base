<script lang="ts">
  // Adapted from pinned MeterValue; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getMeterContext } from './context.js';
  import { emptyState } from './helpers.js';
  import type { MeterValueProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    ref = $bindable(),
    ...props
  }: MeterValueProps = $props();
  const context = getMeterContext();
  const state = emptyState;
  const internal = { 'aria-hidden': true };
  const resolved = $derived({
    ...props,
    class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp),
  });
</script>

{#snippet content()}
  {#if children}{@render children(
      context.formattedValue,
      context.value,
    )}{:else}{context.formattedValue}{/if}
{/snippet}
<Element tag="span" {internal} props={resolved} {state} {render} children={content} bind:ref />
