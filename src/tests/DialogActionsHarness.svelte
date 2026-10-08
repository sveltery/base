<script lang="ts">
	import { Dialog, type DialogActions, type DialogChangeEventDetails } from '#lib';

	let root = $state<DialogActions | undefined>(undefined);

	function changed(open: boolean, details: DialogChangeEventDetails) {
		if (!open) details.preventUnmountOnClose();
	}
</script>

<Dialog.Root bind:this={root} onOpenChange={changed}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup data-testid="popup">
			<Dialog.Title>Title</Dialog.Title>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
<button type="button" onclick={() => root?.unmount()}>Unmount</button>
