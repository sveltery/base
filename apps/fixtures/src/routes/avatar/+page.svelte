<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/avatar-fixture.svelte';
  import Conformance from '../../lib/avatar-conformance.svelte';
  import { installAvatarHarness } from '../../lib/avatar-harness.js';
  let { data } = $props();
  let ready = $state(false), host = $state<HTMLDivElement>();
  onMount(() => {
    const restore = installAvatarHarness(data.scenario); ready = true;
    let stopped = false; let cleanup: (() => void) | undefined;
    if (data.reference) void import('../../lib/avatar-reference.js').then(({ mountAvatarReference }) => { if (!stopped && host) cleanup = mountAvatarReference(host, data.scenario, data.part, data.mode); });
    return () => { stopped = true; cleanup?.(); restore(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else if ready}{#if data.scenario === 'conformance'}<Conformance part={data.part} mode={data.mode}/>{:else}<Fixture scenario={data.scenario}/>{/if}{/if}
