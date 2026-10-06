<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/DialogSourceClosureFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/dialog-source-closure-reference.js').then(
      ({ mountDialogSourceClosureReference }) => {
        if (!stopped) cleanup = mountDialogSourceClosureReference(node, data.keep);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<Fixture keep={data.keep} />{/if}
