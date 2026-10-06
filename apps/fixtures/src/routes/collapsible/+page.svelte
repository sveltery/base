<script lang="ts">
  import { onMount } from 'svelte';
  import CollapsibleFixture from '../../lib/CollapsibleFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/collapsible-reference.js').then(({ mountCollapsibleReference }) => {
      if (!stopped) cleanup = mountCollapsibleReference(node, data.scenario);
    });
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<CollapsibleFixture
    scenario={data.scenario}
  />{/if}
