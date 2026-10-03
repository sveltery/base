<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/FieldFormBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false, cleanup: (() => void) | undefined;
    void import('../../lib/field-form-reference.js').then(({ mountFieldFormReference }) => { if (!disposed) cleanup = mountFieldFormReference(node, data.scenario); });
    return () => { disposed = true; cleanup?.(); };
  });
</script>
{#if data.reference}<section bind:this={host}></section>{:else}<Fixture scenario={data.scenario} />{/if}
