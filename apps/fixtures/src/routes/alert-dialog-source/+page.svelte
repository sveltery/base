<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/AlertDialogSourceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/alert-dialog-source-reference.js').then(
      ({ mountAlertDialogSourceReference }) => {
        if (!stopped) cleanup = mountAlertDialogSourceReference(node, data.line);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<Fixture line={data.line} />{/if}
