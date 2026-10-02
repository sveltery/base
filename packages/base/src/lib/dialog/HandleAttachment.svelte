<script lang="ts">
  // A committed sibling before user children preserves initial descendant mount ordering.
  import { untrack } from 'svelte';
  import type { DialogController } from './controller.svelte.js';
  let { handle, controller }: { handle: { attachStore(controller: DialogController): () => void }; controller: DialogController } = $props();
  $effect(() => { const owner = handle; return untrack(() => owner.attachStore(controller)); });
</script>
