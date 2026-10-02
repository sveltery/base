<script lang="ts">
  import { onMount } from 'svelte';
  import { installAvatarHarness } from '../../lib/avatar-harness.js';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => {
    const restore = installAvatarHarness(data.scenario); let stopped = false; let cleanup: (() => void) | undefined;
    void import('../../lib/avatar-reference.js').then(({ mountAvatarReference }) => { if (!stopped && host) cleanup = mountAvatarReference(host, data.scenario, data.part, data.mode); });
    return () => { stopped = true; cleanup?.(); restore(); };
  });
</script>
<div bind:this={host}></div>
