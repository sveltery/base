<script lang="ts">
  import { getContext } from 'svelte';
  import {
    nativeCaptureContext,
    type NativeCaptureOwner,
  } from './native-navigation-menu-capture-context.js';
  let {
    host = $bindable(null),
    record,
  }: { host?: HTMLDivElement | null; record: (value: string) => void } = $props();
  const owner = getContext<NativeCaptureOwner>(nativeCaptureContext);
  const value = $derived(owner.value);
</script>

<div bind:this={host} data-testid="bare-capture-child-host" data-context={value}>
  <button type="button" data-testid="bare-capture-child" onclick={() => record(`child:${value}`)}
    >Child {value}</button
  >
</div>
