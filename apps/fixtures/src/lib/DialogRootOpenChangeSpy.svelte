<script lang="ts">
  // Native mapping of the pinned Popup descendant's private floating open event subscription.
  import { useDialogRootContext } from '../../../../packages/base/src/lib/dialog/context.js';
  import type { ChangeReason } from '../../../../packages/base/src/lib/dialog/types.js';
  let { observe }: { observe: (details: { open: boolean; reason: ChangeReason }) => void } = $props();
  const store = useDialogRootContext();
  $effect(() => {
    const events = store.select('floatingRootContext').context.events;
    const listener = (details: { open: boolean; reason?: string }) => observe({ open: details.open, reason: details.reason as ChangeReason });
    events.on('openchange', listener);
    return () => { events.off('openchange', listener); };
  });
</script>
