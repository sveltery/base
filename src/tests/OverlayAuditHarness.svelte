<script lang="ts">
	import { Dialog, Popover } from '#lib';
	import PortalReleaseHarness from './PortalReleaseHarness.svelte';

	let {
		case: name,
		part = 'dialog'
	}: {
		case:
			| 'swap'
			| 'nested-clear'
			| 'nested-popovers'
			| 'popover-backdrop'
			| 'popover-trap'
			| 'popover-null'
			| 'tabbable';
		part?: 'dialog' | 'popover';
	} = $props();

	let innerHolder = $state<HTMLDivElement | null>(null);
	let innerContainer = $state<HTMLElement | null>(null);

	function exposeClear(node: HTMLDivElement) {
		innerContainer = node;
		(node as HTMLDivElement & { clearContainer: () => void }).clearContainer = () => {
			innerContainer = null;
		};
	}
</script>

{#if name === 'swap'}
	<PortalReleaseHarness {part} mode="swap" />
{:else if name === 'nested-clear'}
	<Dialog.Root defaultOpen>
		<Dialog.Trigger>Outer</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="outer-popup">
				<button type="button">Outer inside</button>
				<div bind:this={innerHolder} data-testid="inner-holder" {@attach exposeClear}></div>
				{#if innerHolder}
					<Dialog.Root defaultOpen>
						<Dialog.Trigger>Inner</Dialog.Trigger>
						<Dialog.Portal container={innerContainer}>
							<Dialog.Popup>
								<button type="button" data-testid="inner-inside">Inner inside</button>
							</Dialog.Popup>
						</Dialog.Portal>
					</Dialog.Root>
				{/if}
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if name === 'nested-popovers'}
	<button type="button" data-testid="outside">Outside</button>
	<Popover.Root modal>
		<Popover.Trigger>Outer</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup>
					<Popover.Root modal>
						<Popover.Trigger>Inner</Popover.Trigger>
						<Popover.Portal>
							<Popover.Positioner>
								<Popover.Popup data-testid="inner-popup">
									<button type="button">Inside</button>
									<Popover.Close>Inner close</Popover.Close>
								</Popover.Popup>
							</Popover.Positioner>
						</Popover.Portal>
					</Popover.Root>
					<Popover.Close>Outer close</Popover.Close>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if name === 'popover-backdrop' || name === 'popover-trap'}
	<Popover.Root modal={name === 'popover-trap' ? 'trap-focus' : true}>
		<Popover.Trigger>Open</Popover.Trigger>
		<Popover.Portal>
			<Popover.Backdrop style="position: fixed; inset: 0;" data-testid="user-backdrop" />
			<Popover.Positioner>
				<Popover.Popup>
					<button type="button">Inside</button>
					<Popover.Close>Close</Popover.Close>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if name === 'popover-null'}
	<button type="button" data-testid="before">Before</button>
	<Popover.Root>
		<Popover.Trigger>Open</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup finalFocus={null}>
					<button type="button">Inside</button>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if name === 'tabbable'}
	<div data-testid="tabbable-root"></div>
{/if}
