<script lang="ts">
	import { useDialogRootContext } from '../lib/dialog/context.svelte.js';

	const store = useDialogRootContext();
</script>

<div
	data-testid="alert-dialog-state"
	data-modal={String(store.modal)}
	data-disable-pointer-dismissal={String(store.disablePointerDismissal)}
	data-role={store.role}
></div>
