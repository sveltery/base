<script lang="ts">
  import { onMount } from 'svelte';
  import ButtonFixture from '../../lib/ButtonFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/button-reference.js').then(({ mountButtonReference }) => {
      if (!stopped) cleanup = mountButtonReference(node, data.scenario);
    });
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<ButtonFixture
    scenario={data.scenario}
  />{/if}
