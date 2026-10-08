<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part }: { part: 'dialog' | 'popover' } = $props();
	let holder = $state<HTMLDivElement | null>(null);
	let released = $state(false);
	const container = $derived<HTMLElement | null>(released || !holder ? null : holder);

	function exposeClear(node: HTMLDivElement) {
		(node as HTMLDivElement & { clearContainer: () => void }).clearContainer = () => {
			released = true;
		};
	}
</script>

<div bind:this={holder} data-testid="portal-holder" {@attach exposeClear}></div>
<button type="button" data-testid="release" onclick={() => (released = true)}>Release</button>

{#if holder}
	{#if part === 'dialog'}
		<Dialog.Root defaultOpen>
			<Dialog.Trigger>Open</Dialog.Trigger>
			<Dialog.Portal {container}>
				<Dialog.Popup>
					<button type="button">Inside</button>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	{:else}
		<Popover.Root defaultOpen>
			<Popover.Trigger>Open</Popover.Trigger>
			<Popover.Portal {container}>
				<Popover.Positioner>
					<Popover.Popup>
						<button type="button">Inside</button>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	{/if}
{/if}
