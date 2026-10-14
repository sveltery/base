<script lang="ts">
	import { Dialog } from '#lib';

	let editOpen = $state(false);
	let discardOpen = $state(false);
</script>

<Dialog.Root open>
	<Dialog.Portal>
		<Dialog.Popup data-testid="outer">
			<button type="button" onclick={() => (editOpen = true)}>Edit</button>
			<Dialog.Root bind:open={editOpen}>
				<Dialog.Portal>
					<Dialog.Popup data-testid="edit">
						<button type="button" onclick={() => (discardOpen = true)}>Discard</button>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
			<Dialog.Root bind:open={discardOpen}>
				<Dialog.Portal>
					<Dialog.Popup data-testid="discard">
						<Dialog.Close>Cancel</Dialog.Close>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
