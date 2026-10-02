<script lang="ts">
  import { onMount } from 'svelte';
  import { installAvatarHarness, primeAvatarCache } from '../../lib/avatar-harness.js';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => {
    let stopped = false; let cleanup: (() => void) | undefined; let restore: (() => void) | undefined;
    void (async () => {
      await primeAvatarCache(data.scenario);
      if (stopped) return;
      restore = installAvatarHarness(data.scenario);
      const { mountAvatarReference } = await import('../../lib/avatar-reference.js');
      if (!stopped && host) cleanup = mountAvatarReference(host, data.scenario, data.part, data.mode);
    })();
    return () => { stopped = true; cleanup?.(); restore?.(); };
  });
</script>
<div bind:this={host}></div>
