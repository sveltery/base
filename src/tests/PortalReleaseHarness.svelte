<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part, mode = 'release' }: { part: 'dialog' | 'popover'; mode?: 'release' | 'swap' } =
		$props();
	let holder = $state<HTMLDivElement | null>(null);
	let other = $state<HTMLDivElement | null>(null);
	let useOther = $state(false);
	let released = $state(false);
	const container = $derived<HTMLElement | null>(
		mode === 'swap' ? (useOther ? other : holder) : released || !holder ? null : holder
	);
	const ready = $derived(mode === 'swap' ? holder != null && other != null : holder != null);

	function exposeClear(node: HTMLDivElement) {
		(node as HTMLDivElement & { clearContainer: () => void }).clearContainer = () => {
			released = true;
		};
	}

	function exposeSwap(node: HTMLDivElement) {
		(node as HTMLDivElement & { swap: () => void }).swap = () => {
			useOther = true;
		};
	}
</script>

{#if mode === 'swap'}
	<div bind:this={holder} data-testid="box-a" {@attach exposeSwap}></div>
	<div bind:this={other} data-testid="box-b"></div>
{:else}
	<div bind:this={holder} data-testid="portal-holder" {@attach exposeClear}></div>
	<button type="button" data-testid="release" onclick={() => (released = true)}>Release</button>
{/if}

{#if ready}
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
