<script lang="ts">
	import {
		Dialog,
		Popover,
		type DialogActions,
		type DialogChangeEventDetails,
		type PopoverActions,
		type PopoverChangeEventDetails
	} from '#lib';

	let {
		child = 'dialog' as 'dialog' | 'popover',
		outerOpen = $bindable(true),
		innerOpen = $bindable(true)
	} = $props();

	let outerRoot = $state<DialogActions | undefined>(undefined);
	let innerDialog = $state<DialogActions | undefined>(undefined);
	let innerPopover = $state<PopoverActions | undefined>(undefined);
	let outerPopup = $state<HTMLElement | undefined>(undefined);
	let innerPopup = $state<HTMLElement | undefined>(undefined);

	let calls = $state<{ which: string; open: boolean; reason: string }[]>([]);

	function outerChanged(open: boolean, details: DialogChangeEventDetails) {
		calls.push({ which: 'outer', open, reason: details.reason });
	}

	function innerDialogChanged(open: boolean, details: DialogChangeEventDetails) {
		calls.push({ which: 'inner', open, reason: details.reason });
	}

	function innerPopoverChanged(open: boolean, details: PopoverChangeEventDetails) {
		calls.push({ which: 'inner', open, reason: details.reason });
	}

	function captureOuter(node: HTMLElement) {
		outerPopup = node;
	}

	function captureInner(node: HTMLElement) {
		innerPopup = node;
	}
</script>

<button type="button" data-testid="outside">Outside</button>
<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="roots">{outerRoot && (innerDialog || innerPopover) ? 'bound' : ''}</output>
<output data-testid="popups">{outerPopup && innerPopup ? 'attached' : ''}</output>

<Dialog.Root bind:this={outerRoot} bind:open={outerOpen} onOpenChange={outerChanged}>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup data-testid="popup" {@attach captureOuter}>
			<Dialog.Title>Title</Dialog.Title>
			<button type="button">Inside</button>
			{#if child === 'dialog'}
				<Dialog.Root
					bind:this={innerDialog}
					bind:open={innerOpen}
					onOpenChange={innerDialogChanged}
				>
					<Dialog.Trigger>Nested</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup data-testid="nested-popup" {@attach captureInner}>
							<Dialog.Title>Nested title</Dialog.Title>
							<button type="button">Nested inside</button>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			{:else}
				<Popover.Root
					bind:this={innerPopover}
					bind:open={innerOpen}
					onOpenChange={innerPopoverChanged}
				>
					<Popover.Trigger>Nested</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner>
							<Popover.Popup data-testid="nested-popup" {@attach captureInner}>
								<Popover.Title>Nested title</Popover.Title>
								<button type="button">Nested inside</button>
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
			{/if}
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
