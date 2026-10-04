<script lang="ts" generics="Payload = unknown">
  // Native shared view of Source useRenderDialogRoot's Provider/attachment/interactions/children.
  // MIT: Base UI 1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; THIRD_PARTY_NOTICES.md.
  import { onDestroy, setContext, untrack } from 'svelte';
  import PopupHandleAttachment from '../../utils/popups/PopupHandleAttachment.svelte';
  import DialogInteractions from './DialogInteractions.svelte';
  import { useRenderDialogRoot } from './useRenderDialogRoot.svelte.js';
  import { ROOT } from '../context.js';
  import type { RootProps, Actions } from '../types.js';
  interface Props {
    mode: 'dialog' | 'alert-dialog';
    rootProps: RootProps<Payload>;
    floatingId: string;
    actions?: Actions | null | undefined;
  }
  // eslint-disable-next-line no-useless-assignment -- Publishes native imperative actions through the public Root binding.
  let { mode, rootProps: props, floatingId, actions = $bindable(null) }: Props = $props();
  // Each public Root fixes its mode and owns its generated ID for this view's lifetime.
  const root = useRenderDialogRoot<Payload>(untrack(() => mode), () => props, untrack(() => floatingId));
  setContext(ROOT, root.store);
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions replaces the source actionsRef boundary.
  actions = { close: root.close, unmount: root.unmount };
  onDestroy(() => { actions = null; });
</script>
{#if props.handle}
  <PopupHandleAttachment handle={props.handle} store={root.store} />
{/if}
{#if root.shouldRenderInteractions}
  <DialogInteractions store={root.store} parentContext={root.parentStore?.context} isDrawer={root.isDrawer} />
{/if}
{@render props.children?.({ payload: root.store.select('payload') as Payload | undefined })}
