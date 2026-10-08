<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part, provide = false }: { part: 'dialog' | 'popover'; provide?: boolean } = $props();
	let holder = $state<HTMLDivElement | null>(null);
	const container = $derived<HTMLElement | null>(provide && holder ? holder : null);
</script>

<div bind:this={holder} data-testid="portal-holder"></div>

{#if part === 'dialog'}
	<Dialog.Root defaultOpen>
		<Dialog.Portal {container} data-slot="dialog-portal">
			<Dialog.Popup>Body</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<Popover.Root defaultOpen>
		<Popover.Portal {container} data-slot="popover-portal">
			<Popover.Positioner>
				<Popover.Popup>Body</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/if}
