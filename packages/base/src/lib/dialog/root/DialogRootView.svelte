<script lang="ts" generics="Payload = unknown">
  // Shared native provider/attachment/interactions/children composition from useRenderDialogRoot.
  // MIT: Base UI 1.8.0, pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import { setContext, untrack } from 'svelte';
  import PopupHandleAttachment from '../../utils/popups/PopupHandleAttachment.svelte';
  import DialogInteractions from './DialogInteractions.svelte';
  import type { useRenderDialogRoot } from './useRenderDialogRoot.svelte.js';
  import { ROOT } from '../context.js';
  import type { RootProps } from '../types.js';
  interface Props {
    root: ReturnType<typeof useRenderDialogRoot<Payload>>;
    rootProps: RootProps<Payload>;
  }
  let { root, rootProps: props }: Props = $props();
  // The public Root owns this store for the lifetime of the native provider view.
  setContext(
    ROOT,
    untrack(() => root.store),
  );
</script>

{#if props.handle}
  <PopupHandleAttachment handle={props.handle} store={root.store} />
{/if}
{#if root.shouldRenderInteractions}
  <DialogInteractions
    store={root.store}
    parentContext={root.parentStore?.context}
    isDrawer={root.isDrawer}
  />
{/if}
{@render props.children?.({ payload: root.store.select('payload') as Payload | undefined })}
