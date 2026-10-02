<script lang="ts">
  // Mirrors the upstream layout-effect animation-resolution race fixture.
  import { untrack } from 'svelte';
  let { open }: { open: boolean } = $props();
  $effect(() => {
    if (!open) untrack(() => {
      const browser = window as Window & { race?: Animation; raceStarted?: boolean };
      if (browser.raceStarted) browser.race?.finish();
    });
  });
</script>
