<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/RadioBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/radio-reference.js').then(({ mountRadioReference }) => {
      if (!disposed) cleanup = mountRadioReference(node, data.scenario);
    });
    return () => { disposed = true; cleanup?.(); };
  });
</script>
{#if data.reference}<section bind:this={host}></section>{:else}<Fixture scenario={data.scenario} />{/if}
<style>
  :global(#radio-group [role='radio']) {
    display: inline-flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    border: 1px solid currentColor;
    border-radius: 50%;
  }
  :global(#radio-group [role='radio'][data-checked]) {
    background: lightblue;
  }
</style>
