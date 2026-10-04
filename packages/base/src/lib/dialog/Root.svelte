<script lang="ts" generics="Payload = unknown">
  // Source DialogRoot uses the one shared native root view (MIT).
  import DialogRootView from './root/DialogRootView.svelte';
  import type { RootProps } from './types.js';
  let { actions = $bindable(null), ...props }: RootProps<Payload> = $props();
  const generatedId = $props.id();
  export function close() { actions?.close(); }
  export function unmount() { actions?.unmount(); }
</script>
<DialogRootView mode="dialog" rootProps={props} floatingId={generatedId} bind:actions />
