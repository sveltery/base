<script lang="ts">
	import { AlertDialog, type AlertDialogHandle } from '#lib';

	let { handle, nesting }: { handle: AlertDialogHandle; nesting: number } = $props();
</script>

{#snippet wrapped(level: number)}
	{#if level === 0}
		<AlertDialog.Trigger {handle} id="trigger-1" data-testid="trigger-1"
			>Trigger 1</AlertDialog.Trigger
		>
	{:else}
		<div>{@render wrapped(level - 1)}</div>
	{/if}
{/snippet}

{@render wrapped(nesting)}
<AlertDialog.Root {handle}>
	<AlertDialog.Portal>
		<AlertDialog.Popup data-testid="popup">
			<AlertDialog.Close>Close popup</AlertDialog.Close>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
