<script lang="ts">
  // Adapted from pinned ProgressValue; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressValueProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: ProgressValueProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const internal = $derived({ ...statusAttributes(state.status), 'aria-hidden': true });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });
</script>
{#snippet content()}
  {#if children}{@render children(context.state.status === 'indeterminate' ? 'indeterminate' : context.formattedValue, context.value)}{:else}{context.state.status === 'indeterminate' ? '' : context.formattedValue}{/if}
{/snippet}
<Element tag="span" {internal} props={resolved} {state} {render} children={content} bind:ref />
