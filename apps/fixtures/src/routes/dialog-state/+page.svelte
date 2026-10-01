<script lang="ts">
  import { onMount } from 'svelte';
  import StateFixture from '../../lib/StateFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/state-reference.js').then(({ mountStateReference }) => {
      if (!stopped) cleanup = mountStateReference(node, data.scenario);
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<StateFixture scenario={data.scenario} />{/if}
