<script lang="ts">
	import { Dialog, type DialogChangeEventDetails } from '#lib';
	import type { DialogCase } from './cases.js';

	let { scenario }: { scenario: DialogCase } = $props();

	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);

	function changed(open: boolean, details: DialogChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ open, reason: details.reason, canceled: details.isCanceled });
	}
</script>

<button type="button" data-testid="outside">Outside</button>
{#if scenario === 'nested'}
	<Dialog.Root onOpenChange={changed}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="popup">
				<Dialog.Title>Title</Dialog.Title>
				<Dialog.Close>Close</Dialog.Close>
				<Dialog.Root>
					<Dialog.Trigger>Nested</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup data-testid="nested-popup">
							<Dialog.Title>Nested title</Dialog.Title>
							<Dialog.Close>Nested close</Dialog.Close>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<Dialog.Root modal={scenario === 'outside' ? false : true} onOpenChange={changed}>
		<Dialog.Trigger disabled={scenario === 'disabled'}>Open</Dialog.Trigger>
		<Dialog.Portal>
			{#if scenario !== 'outside'}
				<Dialog.Backdrop />
			{/if}
			<Dialog.Popup data-testid="popup">
				<Dialog.Title>Title</Dialog.Title>
				<Dialog.Description>Description</Dialog.Description>
				<button type="button">Inside</button>
				<Dialog.Close>Close</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
