<script lang="ts">
  import { onMount } from 'svelte';
  import InputFixture from '../../lib/InputFixture.svelte';
  import InputConformanceFixture from '../../lib/InputConformanceFixture.svelte';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/input-reference.js').then(({ mountInputReference }) => { if (!stopped) cleanup = mountInputReference(node, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else if data.scenario.startsWith('conformance-')}<InputConformanceFixture scenario={data.scenario} />{:else}<InputFixture scenario={data.scenario} />{/if}
