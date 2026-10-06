<script lang="ts" generics="Store">
  // Original PopupHandleAttachment composition with native committed effect lifetime (MIT).

  let { handle, store }: { handle: { attachStore(store: Store): () => void }; store: Store } =
    $props();
  $effect(() => handle.attachStore(store));
</script>
