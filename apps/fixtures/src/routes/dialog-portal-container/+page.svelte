<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/DialogPortalContainerFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/dialog-portal-container-reference.js').then(
      ({ mountPortalContainerReference }) => {
        if (!stopped) cleanup = mountPortalContainerReference(node, data.scenario);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<Fixture scenario={data.scenario} />{/if}
