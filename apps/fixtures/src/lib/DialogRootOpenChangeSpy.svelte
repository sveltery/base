<script lang="ts">
  // Native mapping of the pinned Popup descendant's private event subscription.
  import { root } from '../../../../packages/base/src/lib/dialog/context.js';
  import type { ChangeReason } from '../../../../packages/base/src/lib/dialog/types.js';
  let { observe }: { observe: (details: { open: boolean; reason: ChangeReason }) => void } = $props();
  const controller = root();
  $effect(() => {
    const listener = observe;
    controller.openChangeListeners.add(listener);
    return () => { controller.openChangeListeners.delete(listener); };
  });
</script>
