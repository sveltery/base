<script lang="ts">
  // Bare native control for Toast's disputed focused-host removal boundary.
  let visible = $state(true);
  let hydrated = $state(false);
  import { onMount } from 'svelte';
  onMount(() => {
    hydrated = true;
  });
  function expose(node: HTMLElement) {
    const host = node as HTMLElement & { removeFocusedControl?: () => void };
    host.removeFocusedControl = () => {
      visible = false;
    };
    return () => {
      delete host.removeFocusedControl;
    };
  }
</script>

<main data-hydrated={String(hydrated)} data-testid="removal-control" {@attach expose}>
  {#if visible}<div tabindex="-1" id="bare-focused-host">Bare Svelte focused host</div>{/if}
</main>
