<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part, preventUnmount = false }: { part: 'popover' | 'dialog'; preventUnmount?: boolean } =
		$props();
	let open = $state(false);

	/** Writes the binding without a click, which would be an outside press. */
	export function setOpenFromParent(next: boolean) {
		open = next;
	}

	function onOpenChange(next: boolean, details: { preventUnmountOnClose(): void }) {
		if (!next && preventUnmount) details.preventUnmountOnClose();
	}
</script>

<button type="button" onclick={() => (open = true)}>Open from parent</button>
<button type="button" onclick={() => (open = false)}>Close from parent</button>

{#if part === 'popover'}
	<Popover.Root bind:open {onOpenChange}>
		<Popover.Trigger>Trigger</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup>Content</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else}
	<Dialog.Root bind:open {onOpenChange}>
		<Dialog.Trigger>Trigger</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup>Content</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{/if}
