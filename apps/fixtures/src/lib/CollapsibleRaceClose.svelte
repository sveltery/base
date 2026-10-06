<script lang="ts">
  // Resolve during the close render before Panel user-effect observer cleanup.
  // React uses a post-DOM layout effect; Svelte pre effects run before the DOM update.
  import { untrack } from 'svelte';
  let { open }: { open: boolean } = $props();
  $effect.pre(() => {
    if (!open)
      untrack(() => {
        const browser = window as Window & { race?: Animation; raceStarted?: boolean };
        if (browser.raceStarted) browser.race?.finish();
      });
  });
</script>
