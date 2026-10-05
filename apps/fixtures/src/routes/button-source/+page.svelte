<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/ButtonSourceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/button-source-reference.js').then(({ hydrateButtonSourceReference }) => { if (!stopped) cleanup = hydrateButtonSourceReference(node, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -- Exact trusted original-source React SSR fixture. -->
{#if data.reference}<div bind:this={host}>{@html data.html}</div>{:else}<Fixture scenario={data.scenario}/>{/if}
