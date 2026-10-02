<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/toast-portal-reference.js').then(({ mountToastPortalReference }) => { if (!stopped) cleanup = mountToastPortalReference(host!, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<div bind:this={host}></div>
