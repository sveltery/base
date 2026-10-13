<script lang="ts">
	import { AlertDialog, type AlertDialogHandle } from '#lib';

	let {
		handle,
		phase,
		onOpenError
	}: {
		handle: AlertDialogHandle;
		phase: 'outgoing' | 'overlap' | 'incoming';
		onOpenError: (error: unknown) => void;
	} = $props();

	// Upstream opens from a layout effect in the commit that mounts the incoming root.
	function openOnMount() {
		try {
			handle.open('trigger-2');
		} catch (error) {
			onOpenError(error);
		}
	}
</script>

{#snippet root(key: string)}
	<AlertDialog.Root {handle}>
		<AlertDialog.Portal>
			<AlertDialog.Popup>{key}</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
{/snippet}

{#each [1, 2] as number (number)}
	<AlertDialog.Trigger {handle} id={`trigger-${number}`} data-testid={`trigger-${number}`}>
		Trigger {number}
	</AlertDialog.Trigger>
{/each}
{#if phase === 'outgoing' || phase === 'overlap'}
	{@render root('outgoing')}
{/if}
{#if phase === 'overlap' || phase === 'incoming'}
	{@render root('incoming')}
	<div {@attach openOnMount}></div>
{/if}
