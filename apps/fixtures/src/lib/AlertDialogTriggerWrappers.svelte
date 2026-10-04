<script lang="ts">
  import { AlertDialog } from '@sveltery/base';
  import Wrappers from './AlertDialogTriggerWrappers.svelte';
  let { handle, nesting }: { handle: AlertDialog.Handle<number>; nesting: number } = $props();
</script>
{#if nesting > 0}<div><Wrappers {handle} nesting={nesting - 1}/></div>
{:else}<AlertDialog.Trigger {handle}>Trigger</AlertDialog.Trigger>{/if}
