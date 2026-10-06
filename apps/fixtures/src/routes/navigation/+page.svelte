<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/NavigationFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/navigation-reference.js').then(({ mountNavigationReference }) => {
      if (!disposed)
        cleanup = mountNavigationReference(node, data.scenario, data.direction, data.orientation);
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<section bind:this={host}></section>{:else}<Fixture
    scenario={data.scenario}
    direction={data.direction}
    orientation={data.orientation}
  />{/if}
