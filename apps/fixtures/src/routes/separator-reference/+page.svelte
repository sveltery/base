<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/separator-reference.js').then(({ mountSeparatorReference }) => { if (!stopped) cleanup = mountSeparatorReference(host!, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<div bind:this={host}></div>
<style>
  :global([data-testid='root']), :global([data-testid='custom-root']), :global([data-testid='wrapped']) { min-height: 2px; min-width: 2px; }
</style>
