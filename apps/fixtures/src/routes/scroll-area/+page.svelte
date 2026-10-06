<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/ScrollAreaBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/scroll-area-reference.js').then(({ mountScrollAreaReference }) => {
      if (!disposed) cleanup = mountScrollAreaReference(node, data.options);
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<section bind:this={host}></section>{:else}<Fixture
    options={data.options}
  />{/if}
