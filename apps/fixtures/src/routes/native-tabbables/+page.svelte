<script lang="ts">
  import { onMount } from 'svelte';
  import NativeTabbablesFixture from '../../lib/NativeTabbablesFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/native-tabbables-reference.js').then(({ mountNativeTabbablesReference }) => {
      if (!stopped) cleanup = mountNativeTabbablesReference(node, data.scenario);
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<NativeTabbablesFixture scenario={data.scenario} />{/if}
