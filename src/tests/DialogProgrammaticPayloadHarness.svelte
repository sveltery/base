<script lang="ts">
	import { Dialog, type DialogHandle } from '#lib';

	let {
		handle,
		showTrigger = false,
		declineClose = false,
		open = $bindable(false)
	}: {
		handle: DialogHandle<string>;
		showTrigger?: boolean;
		declineClose?: boolean;
		open?: boolean;
	} = $props();
</script>

{#if showTrigger}
	<Dialog.Trigger {handle} id="trigger" payload="from trigger">Trigger</Dialog.Trigger>
{/if}
<Dialog.Root
	{handle}
	bind:open
	onOpenChange={(next, details) => {
		if (declineClose && !next) details.cancel();
	}}
>
	{#snippet children({ payload })}
		<Dialog.Portal>
			<Dialog.Popup data-testid="content">{payload}</Dialog.Popup>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
