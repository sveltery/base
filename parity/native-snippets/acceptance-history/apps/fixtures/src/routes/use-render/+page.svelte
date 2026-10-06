<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/UseRenderBrowserFixture.svelte';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/use-render-reference.js').then(({ mountUseRenderReference }) => { if (!stopped) cleanup = mountUseRenderReference(node, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<Fixture scenario={data.scenario}/>{/if}
