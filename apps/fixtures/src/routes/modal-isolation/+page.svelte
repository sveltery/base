<script lang="ts">
  import { onMount } from 'svelte';
  import ModalIsolationFixture from '../../lib/ModalIsolationFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/modal-isolation-reference.js').then(
      ({ mountModalIsolationReference }) => {
        if (!stopped) cleanup = mountModalIsolationReference(node, data.scenario);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<ModalIsolationFixture
    scenario={data.scenario}
  />{/if}
