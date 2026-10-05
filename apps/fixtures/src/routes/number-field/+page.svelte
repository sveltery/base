<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/NumberFieldBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/number-field-reference.js').then(({ mountNumberFieldReference }) => {
      if (!disposed) cleanup = mountNumberFieldReference(node, data.scenario, data.renderMode);
    });
    return () => { disposed = true; cleanup?.(); };
  });
</script>
{#if data.reference}<section bind:this={host}></section>{:else if data.renderMode !== 'csr' || mounted}<Fixture scenario={data.scenario} />{/if}
