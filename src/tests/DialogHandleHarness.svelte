<script lang="ts">
	import { Dialog, type DialogHandle } from '#lib';

	let {
		handle,
		payload = 'from-trigger',
		id = 'detached',
		defaultOpen = false,
		defaultTriggerId = null
	}: {
		handle: DialogHandle<string>;
		payload?: string;
		id?: string;
		defaultOpen?: boolean;
		defaultTriggerId?: string | null;
	} = $props();
</script>

<Dialog.Trigger {handle} {id} {payload}>Detached</Dialog.Trigger>
<Dialog.Root {handle} {defaultOpen} {defaultTriggerId}>
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
