<script lang="ts">
  import { onMount } from 'svelte';
  import InitialFocusFixture from '../../lib/InitialFocusFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/initial-focus-reference.js').then(({ mountInitialFocusReference }) => {
      if (!stopped) cleanup = mountInitialFocusReference(node, data.scenario);
    });
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<InitialFocusFixture
    scenario={data.scenario}
  />{/if}
