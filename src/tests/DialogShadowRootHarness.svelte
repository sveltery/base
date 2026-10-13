<script lang="ts">
	import { AlertDialog, Dialog, type DialogChangeEventDetails } from '#lib';

	type Container = HTMLElement | ShadowRoot | undefined;

	let {
		nested,
		outerContainer,
		nestedContainer,
		onOpenChange
	}: {
		/** The nested popup kind, or none for a lone non-modal dialog with an outside element. */
		nested?: 'modal dialog' | 'non-modal dialog' | 'alert dialog';
		outerContainer?: Container;
		nestedContainer?: Container;
		onOpenChange?: (open: boolean, details: DialogChangeEventDetails) => void;
	} = $props();

	let open = $state(true);
	const modal = $derived(nested !== 'non-modal dialog' && nested !== undefined);
</script>

{#if !nested}<div data-testid="outside">Outside</div>{/if}
<Dialog.Root bind:open {modal} {onOpenChange}>
	<Dialog.Portal container={outerContainer}>
		{#if modal}<Dialog.Backdrop />{/if}
		<Dialog.Popup data-testid="outer">
			{#if nested === 'alert dialog'}
				<AlertDialog.Root>
					<AlertDialog.Trigger data-testid="open-nested">Open nested</AlertDialog.Trigger>
					<AlertDialog.Portal container={nestedContainer}>
						<AlertDialog.Backdrop />
						<AlertDialog.Popup data-testid="nested">
							<AlertDialog.Close data-testid="close-nested">Close</AlertDialog.Close>
						</AlertDialog.Popup>
					</AlertDialog.Portal>
				</AlertDialog.Root>
			{:else if nested}
				<Dialog.Root modal={nested === 'modal dialog'}>
					<Dialog.Trigger data-testid="open-nested">Open nested</Dialog.Trigger>
					<Dialog.Portal container={nestedContainer}>
						{#if nested === 'modal dialog'}<Dialog.Backdrop />{/if}
						<Dialog.Popup data-testid="nested">
							<Dialog.Close data-testid="close-nested">Close</Dialog.Close>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			{/if}
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
