<script lang="ts">
	import { Dialog, type DialogHandle } from '#lib';

	let {
		handle,
		showTrigger = false,
		declineClose = false,
		holdExit = false,
		triggerPayload = 'from trigger',
		open = $bindable(false)
	}: {
		handle: DialogHandle<string>;
		showTrigger?: boolean;
		declineClose?: boolean;
		holdExit?: boolean;
		triggerPayload?: string;
		open?: boolean;
	} = $props();
</script>

{#if showTrigger}
	<Dialog.Trigger {handle} id="trigger" payload={triggerPayload}>Trigger</Dialog.Trigger>
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
			<Dialog.Popup data-testid="content" class={holdExit ? 'hold' : undefined}
				>{payload}</Dialog.Popup
			>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>

<style>
	:global(.hold[data-ending-style]) {
		animation: sveltery-dialog-exit-hold 3s linear both;
	}

	@keyframes -global-sveltery-dialog-exit-hold {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.5;
		}
	}
</style>
