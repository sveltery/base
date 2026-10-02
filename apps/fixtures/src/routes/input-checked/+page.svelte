<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/InputCheckedFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const target = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/input-checked-reference.js').then(({ mountInputCheckedReference }) => { if (!stopped) cleanup = mountInputCheckedReference(target, data.scenario); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<Fixture scenario={data.scenario} />{/if}
