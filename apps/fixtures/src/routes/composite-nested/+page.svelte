<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/CompositeNestedBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const target = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/composite-nested-reference.js').then(({ mountNestedComposite }) => {
      if (!disposed) cleanup = mountNestedComposite(target, () => {}).unmount;
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>
{#if data.reference}<section bind:this={host}></section>{:else}<Fixture />{/if}
