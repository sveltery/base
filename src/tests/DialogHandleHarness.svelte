<script lang="ts">
	import { Dialog, type DialogHandle } from '#lib';

	let { handle, payload = 'from-trigger' }: { handle: DialogHandle<string>; payload?: string } =
		$props();
</script>

<Dialog.Trigger {handle} id="detached" {payload}>Detached</Dialog.Trigger>
<Dialog.Root {handle}>
	{#snippet children({ payload: value })}
		<Dialog.Trigger>Inside</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="popup">
				<Dialog.Title>Handled</Dialog.Title>
				<p data-testid="payload">{value ?? ''}</p>
				<Dialog.Close>Close</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
