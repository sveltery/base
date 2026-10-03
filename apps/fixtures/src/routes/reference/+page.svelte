<script lang="ts">
  import { onMount } from 'svelte';
  let host: HTMLDivElement;
  onMount(() => {
    let cleanup: (() => void) | undefined;
    let stopped = false;
    void import('../../lib/react-reference.js').then(({ mountReference }) => { if (!stopped) cleanup = mountReference(host, new URLSearchParams(location.search)); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<div bind:this={host}></div>
<style>
  :global(.reference-animated) { transition: opacity 200ms; }
  :global(.reference-animated[data-starting-style]), :global(.reference-animated[data-ending-style]) { opacity: 0; }
</style>
