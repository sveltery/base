<script lang="ts">
  import { onMount, flushSync } from 'svelte';
  import Fixture from '../../lib/avatar-fixture.svelte';
  import Conformance from '../../lib/avatar-conformance.svelte';
  import { installAvatarHarness, primeAvatarCache, registerAvatarCommit } from '../../lib/avatar-harness.js';
  let { data } = $props();
  let ready = $state(false), host = $state<HTMLDivElement>();
  onMount(() => {
    let stopped = false; let cleanup: (() => void) | undefined; let restore: (() => void) | undefined;
    void (async () => {
      await primeAvatarCache(data.scenario);
      if (stopped) return;
      restore = installAvatarHarness(data.scenario);
      if (data.reference) {
        const { mountAvatarReference } = await import('../../lib/avatar-reference.js');
        if (!stopped && host) cleanup = mountAvatarReference(host, data.scenario, data.part, data.mode);
      } else {
        ready = true; flushSync();
        const main = document.querySelector<HTMLElement>('main');
        if (!main) throw new Error('Avatar Svelte fixture did not commit a host');
        cleanup = registerAvatarCommit(main, action => flushSync(action));
      }
    })();
    return () => { stopped = true; cleanup?.(); restore?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else if ready}{#if data.scenario === 'conformance'}<Conformance part={data.part} mode={data.mode}/>{:else}<Fixture scenario={data.scenario}/>{/if}{/if}
