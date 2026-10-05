<script lang="ts">
  // Adapted from pinned ProgressIndicator; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressIndicatorProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    ref = $bindable(),
    ...props
  }: ProgressIndicatorProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const internal = $derived({
    ...statusAttributes(state.status),
    style:
      context.percentageValue == null
        ? undefined
        : `inset-inline-start:0;height:inherit;width:${context.percentageValue}%`,
  });
  const resolved = $derived({
    ...props,
    class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp),
  });
</script>

<Element tag="div" {internal} props={resolved} {state} {render} {children} bind:ref />
