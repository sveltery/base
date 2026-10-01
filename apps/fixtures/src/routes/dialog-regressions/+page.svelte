<script lang="ts">
  import { onMount } from 'svelte';
  import RegressionFixture from '../../lib/RegressionFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/regression-reference.js').then(({ mountRegressionReference }) => { if (!stopped) cleanup = mountRegressionReference(node, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<RegressionFixture scenario={data.scenario} />{/if}
