<script lang="ts" generics="Payload = unknown">
  // Source DialogRoot → useRenderDialogRoot → attachment/interactions composition (MIT).
  import { onDestroy, setContext } from 'svelte';
  import PopupHandleAttachment from '../utils/popups/PopupHandleAttachment.svelte';
  import DialogInteractions from './root/DialogInteractions.svelte';
  import { useRenderDialogRoot } from './root/useRenderDialogRoot.svelte.js';
  import { ROOT } from './context.js';
  import type { RootProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native imperative actions to the owner.
  let { actions = $bindable(null), ...props }: RootProps<Payload> = $props();
  const generatedId = $props.id();
  const root = useRenderDialogRoot<Payload>('dialog', () => props, generatedId);
  setContext(ROOT, root.store);
  export function close() { root.close(); }
  export function unmount() { root.unmount(); }
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions replaces the source actionsRef boundary.
  actions = { close, unmount };
  onDestroy(() => { actions = null; });
</script>
{#if props.handle}
  <PopupHandleAttachment handle={props.handle} store={root.store} />
{/if}
{#if root.shouldRenderInteractions}
  <DialogInteractions store={root.store} parentContext={root.parentStore?.context} isDrawer={root.isDrawer} />
{/if}
{@render props.children?.({ payload: root.store.select('payload') as Payload | undefined })}
