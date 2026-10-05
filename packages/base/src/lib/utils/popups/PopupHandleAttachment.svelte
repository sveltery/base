<script lang="ts" generics="Store">
  // Original PopupHandleAttachment composition with native committed effect lifetime (MIT).
  import { useIsoLayoutEffect } from '../useIsoLayoutEffect.svelte.js';
  let { handle, store }: { handle: { attachStore(store: Store): () => void }; store: Store } =
    $props();
  useIsoLayoutEffect(
    () => handle.attachStore(store),
    () => [handle, store],
  );
</script>
