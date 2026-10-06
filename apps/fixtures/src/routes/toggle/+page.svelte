<script lang="ts">
  import { onMount } from 'svelte';
  import ToggleFixture from '../../lib/ToggleFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/toggle-reference.js').then(({ mountToggleReference }) => {
      if (!stopped) cleanup = mountToggleReference(node, data.scenario);
    });
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<ToggleFixture
    scenario={data.scenario}
  />{/if}
