<script lang="ts">
  import { onMount } from 'svelte';
  import FocusOwnershipFixture from '../../lib/FocusOwnershipFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/focus-ownership-reference.js').then(
      ({ mountFocusOwnershipReference }) => {
        if (!stopped) cleanup = mountFocusOwnershipReference(node, data.scenario);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<FocusOwnershipFixture
    scenario={data.scenario}
  />{/if}
