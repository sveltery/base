<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/toast-reference.js').then(({ mountToastReference }) => { if (!stopped) cleanup = mountToastReference(node, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<div bind:this={host}></div>
