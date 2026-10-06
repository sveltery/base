<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/DirectionProviderFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/direction-provider-reference.js').then(
      ({ mountDirectionProviderReference }) => {
        if (!stopped) cleanup = mountDirectionProviderReference(node, data.scenario);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<Fixture scenario={data.scenario} />{/if}
