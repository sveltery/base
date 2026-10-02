<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/AnchorPositioningFixture.svelte';
  import '../../lib/anchor-positioning.css';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/anchor-positioning-reference.js').then(({ mountAnchorPositioningReference }) => {
      if (!stopped) cleanup = mountAnchorPositioningReference(node, data.scenario);
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<Fixture scenario={data.scenario} />{/if}
