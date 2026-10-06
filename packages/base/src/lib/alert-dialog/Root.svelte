<script lang="ts" generics="Payload = unknown">
  // Base UI 1.8.0 Root → shared useRenderDialogRoot and native provider view (MIT).
  // Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; THIRD_PARTY_NOTICES.md.
  import { onDestroy } from 'svelte';
  import DialogRootView from '../dialog/root/DialogRootView.svelte';
  import { useRenderDialogRoot } from '../dialog/root/useRenderDialogRoot.svelte.js';
  import type { AlertDialogRootProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native imperative actions to the owner.
  let { actions = $bindable(null), ...props }: AlertDialogRootProps<Payload> = $props();
  const generatedId = $props.id();
  const root = useRenderDialogRoot<Payload>('alert-dialog', () => props, generatedId);
  export function close() {
    root.close();
  }
  export function unmount() {
    root.unmount();
  }
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions replaces Source actionsRef.
  actions = { close, unmount };
  onDestroy(() => {
    actions = null;
  });
</script>

<DialogRootView {root} rootProps={props} />
