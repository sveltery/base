<script lang="ts" generics="Payload = unknown">
  // Source AlertDialogRoot → SAME useRenderDialogRoot('alert-dialog') via shared native view (MIT).
  import DialogRootView from '../dialog/root/DialogRootView.svelte';
  import type { AlertDialogRootProps } from './types.js';
  let { actions = $bindable(null), ...props }: AlertDialogRootProps<Payload> = $props();
  const generatedId = $props.id();
  export function close() { actions?.close(); }
  export function unmount() { actions?.unmount(); }
</script>
<DialogRootView mode="alert-dialog" rootProps={props} floatingId={generatedId} bind:actions />
