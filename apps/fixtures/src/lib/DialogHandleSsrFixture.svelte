<script lang="ts">
  // Complete D:19 topology and server snapshot. MIT: parity/dialog/UPSTREAM_LICENSE.
  import { onMount } from 'svelte';
  import Root from '../../../../packages/base/src/lib/dialog/Root.svelte';
  import Trigger from '../../../../packages/base/src/lib/dialog/Trigger.svelte';
  import { createDialogHandle, type DialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  let { handle = createDialogHandle() }: { handle?: DialogHandle<unknown> } = $props();
  let hydrated = $state(false);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <Root {handle} defaultOpen defaultTriggerId="trigger"/>
  <Trigger {handle} id="trigger">Trigger</Trigger>
</main>
