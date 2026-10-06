<script lang="ts">
  // Exact Source AlertDialogState probe; uses the real shared Root context (MIT).
  import { useDialogRootContext } from '../../../../packages/base/dist/dialog/context.js';
  const store = useDialogRootContext();
</script>

<div
  data-testid="alert-dialog-state"
  data-modal={String(store.select('modal'))}
  data-disable-pointer-dismissal={String(store.select('disablePointerDismissal'))}
  data-role={store.select('role')}
></div>
