<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '$lib/AlertDialogClosureFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host; let stopped = false; let cleanup: (() => void) | undefined;
    void import('$lib/alert-dialog-closure-reference.js').then(({ mountAlertDialogClosureReference }) => { if (!stopped) cleanup = mountAlertDialogClosureReference(node, data.variant); });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.reference}<div bind:this={host}></div>{:else}<Fixture variant={data.variant}/>{/if}
