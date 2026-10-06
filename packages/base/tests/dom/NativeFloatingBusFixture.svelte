<script lang="ts">
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { DialogHandle } from '../../src/lib/dialog/store/DialogHandle.svelte.js';
  import { useFocus } from '../../src/lib/floating-ui/hooks/useFocus.svelte.js';
  import { useHoverReferenceInteraction } from '../../src/lib/floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
  import { useDismiss } from '../../src/lib/floating-ui/hooks/useDismiss.svelte.js';
  let { handle, kind }: { handle: DialogHandle<number>; kind: 'focus' | 'hover' | 'dismiss' } =
    $props();
  const consumer = untrack(() => kind);
  const focus =
    consumer === 'focus' ? useFocus(() => handle.store.state.floatingRootContext) : undefined;
  const hover =
    consumer === 'hover'
      ? useHoverReferenceInteraction(() => handle.store.state.floatingRootContext)
      : undefined;
  const dismiss =
    consumer === 'dismiss' ? useDismiss(() => handle.store.state.floatingRootContext) : undefined;
  const interactionProps = $derived(focus?.reference ?? hover?.() ?? dismiss?.reference);
  const key = createAttachmentKey();
  function attach(host: HTMLButtonElement) {
    const root = handle.store.state.floatingRootContext;
    untrack(() => root.update({ domReferenceElement: host, referenceElement: host }));
    return () =>
      untrack(() => {
        if (root.state.domReferenceElement === host)
          root.update({ domReferenceElement: null, referenceElement: null });
      });
  }
</script>

<button id="native-floating-reference" type="button" {...interactionProps} {...{ [key]: attach }}
  >Native interaction consumer</button
>
