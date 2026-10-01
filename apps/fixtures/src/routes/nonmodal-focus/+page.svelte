<script lang="ts">
  import { onMount } from 'svelte';
  import NonmodalFocusFixture from '../../lib/NonmodalFocusFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/nonmodal-focus-reference.js').then(({ mountNonmodalFocusReference }) => { if (!stopped) cleanup = mountNonmodalFocusReference(node, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<NonmodalFocusFixture scenario={data.scenario} />{/if}
