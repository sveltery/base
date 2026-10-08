<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part }: { part: 'dialog' | 'popover' } = $props();

	// Starts outside the document. The spec appends it after the popup mounts.
	const holder = document.createElement('div');

	function remember(node: HTMLDivElement) {
		(node as HTMLDivElement & { lateHolder: HTMLDivElement }).lateHolder = holder;
		return () => {
			holder.remove();
		};
	}
</script>

<div data-testid="late-anchor" {@attach remember}></div>

{#if part === 'dialog'}
	<Dialog.Root defaultOpen>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal container={holder}>
			<Dialog.Popup>Body</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<Popover.Root defaultOpen>
		<Popover.Trigger>Open</Popover.Trigger>
		<Popover.Portal container={holder}>
			<Popover.Positioner>
				<Popover.Popup>Body</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/if}
