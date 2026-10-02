<script lang="ts">
  import { onMount } from 'svelte';
  import CSPFixture from '../../lib/CSPFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/csp-reference.js').then(({ mountCSPReference }) => { if (!stopped) cleanup = mountCSPReference(node); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<CSPFixture />{/if}
