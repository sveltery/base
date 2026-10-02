<script lang="ts">
  // Adapted from pinned MeterTrack; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import type { MeterTrackProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: MeterTrackProps = $props();
  const state = {};
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });
</script>
<Element tag="div" props={resolved} {state} {render} {children} bind:ref />
