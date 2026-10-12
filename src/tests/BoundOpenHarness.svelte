<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part }: { part: 'popover' | 'dialog' } = $props();
	let open = $state(false);
</script>

<button type="button" onclick={() => (open = true)}>Open from parent</button>
<button type="button" onclick={() => (open = false)}>Close from parent</button>

{#if part === 'popover'}
	<Popover.Root bind:open>
		<Popover.Trigger>Trigger</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup>Content</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else}
	<Dialog.Root bind:open>
		<Dialog.Trigger>Trigger</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup>Content</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{/if}
