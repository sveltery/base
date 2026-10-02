<script lang="ts">
  // Adapted from pinned ProgressTrack; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressTrackProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: ProgressTrackProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const internal = $derived({ ...statusAttributes(state.status) });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });
</script>
<Element tag="div" {internal} props={resolved} {state} {render} {children} bind:ref />
