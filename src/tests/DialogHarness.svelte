<script lang="ts">
	import { Dialog, type DialogChangeEventDetails, type FocusTarget } from '#lib';

	let {
		open = $bindable(false),
		modal = true as boolean | 'trap-focus',
		disabled = false,
		keepMounted = false,
		disablePointerDismissal = false,
		nested = false,
		withBackdrop = true,
		withViewport = false,
		initialFocus = undefined as FocusTarget | undefined,
		finalFocus = undefined as FocusTarget | undefined,
		onOpenChange = undefined as
			((open: boolean, details: DialogChangeEventDetails) => void) | undefined,
		title = 'Title',
		description = 'Description'
	} = $props();
</script>

<button type="button" data-testid="outside">Outside</button>
<Dialog.Root bind:open {modal} {onOpenChange} {disablePointerDismissal}>
	<Dialog.Trigger {disabled}>Open</Dialog.Trigger>
	<Dialog.Portal {keepMounted}>
		{#if withBackdrop}
			<Dialog.Backdrop />
		{/if}
		{#if withViewport}
			<Dialog.Viewport data-testid="viewport">
				<Dialog.Popup data-testid="popup" {initialFocus} {finalFocus}>
					<Dialog.Title>{title}</Dialog.Title>
					<Dialog.Description>{description}</Dialog.Description>
					<button type="button">Inside</button>
					<Dialog.Close>Close</Dialog.Close>
					{#if nested}
						<Dialog.Root>
							<Dialog.Trigger>Nested</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Popup data-testid="nested-popup">
									<Dialog.Title>Nested title</Dialog.Title>
									<Dialog.Close>Nested close</Dialog.Close>
								</Dialog.Popup>
							</Dialog.Portal>
						</Dialog.Root>
					{/if}
				</Dialog.Popup>
			</Dialog.Viewport>
		{:else}
			<Dialog.Popup data-testid="popup" {initialFocus} {finalFocus}>
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Description>{description}</Dialog.Description>
				<button type="button">Inside</button>
				<Dialog.Close>Close</Dialog.Close>
				{#if nested}
					<Dialog.Root>
						<Dialog.Trigger>Nested</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Popup data-testid="nested-popup">
								<Dialog.Title>Nested title</Dialog.Title>
								<Dialog.Close>Nested close</Dialog.Close>
							</Dialog.Popup>
						</Dialog.Portal>
					</Dialog.Root>
				{/if}
			</Dialog.Popup>
		{/if}
	</Dialog.Portal>
</Dialog.Root>
