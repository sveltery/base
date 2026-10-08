<script lang="ts">
	import {
		Dialog,
		Popover,
		type DialogActions,
		type DialogChangeEventDetails,
		type DialogFocusTarget,
		type PopoverActions
	} from '#lib';
	import type { DialogCase } from './cases.js';

	let {
		scenario = 'standalone' as DialogCase,
		open = $bindable(undefined as boolean | undefined),
		defaultOpen = false,
		modal = undefined as boolean | 'trap-focus' | undefined,
		disabled = undefined as boolean | undefined,
		keepMounted = false,
		disablePointerDismissal = false,
		nested = undefined as boolean | undefined,
		withBackdrop = undefined as boolean | undefined,
		withViewport = false,
		initialFocus = undefined as DialogFocusTarget | undefined,
		finalFocus = undefined as DialogFocusTarget | undefined,
		onOpenChange = undefined as
			((open: boolean, details: DialogChangeEventDetails) => void) | undefined,
		title = 'Title',
		description = 'Description',
		triggerId = $bindable(undefined as string | null | undefined),
		defaultTriggerId = null as string | null,
		twoTriggers = false,
		preventUnmount = false,
		innerOpen = $bindable(true)
	} = $props();

	let root = $state<DialogActions | undefined>(undefined);
	let innerRoot = $state<DialogActions | PopoverActions | undefined>(undefined);
	let outerPopup = $state<HTMLElement | undefined>(undefined);
	let innerPopup = $state<HTMLElement | undefined>(undefined);

	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);

	const modalValue = $derived(modal ?? (scenario === 'outside' ? false : true));
	const disabledValue = $derived(disabled ?? scenario === 'disabled');
	const nestedValue = $derived(nested ?? scenario === 'nested');
	const alreadyOpen = $derived(scenario === 'nested-open' || scenario === 'nested-popover');
	const backdrop = $derived(
		withBackdrop ?? (scenario !== 'outside' && scenario !== 'nested' && !alreadyOpen)
	);
	function captureOuter(node: HTMLElement) {
		outerPopup = node;
	}

	function captureInner(node: HTMLElement) {
		innerPopup = node;
	}

	function changed(next: boolean, details: DialogChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		if (preventUnmount && !next) details.preventUnmountOnClose();
		onOpenChange?.(next, details);
		calls.push({ open: next, reason: details.reason, canceled: details.isCanceled });
	}

	function record(next: boolean, details: { reason: string; isCanceled: boolean }) {
		calls.push({ open: next, reason: details.reason, canceled: details.isCanceled });
	}
</script>

<button type="button" data-testid="outside">Outside</button>
{#if preventUnmount}
	<button type="button" onclick={() => root?.unmount()}>Unmount</button>
{/if}
<Dialog.Root
	bind:this={root}
	bind:open
	bind:triggerId
	defaultOpen={alreadyOpen || defaultOpen}
	{defaultTriggerId}
	modal={modalValue}
	onOpenChange={changed}
	{disablePointerDismissal}
>
	{#if twoTriggers}
		<Dialog.Trigger id="one">One</Dialog.Trigger>
		<Dialog.Trigger id="two">Two</Dialog.Trigger>
	{:else}
		<Dialog.Trigger disabled={disabledValue}>Open</Dialog.Trigger>
	{/if}
	<Dialog.Portal {keepMounted}>
		{#if backdrop}
			<Dialog.Backdrop />
		{/if}
		{#if withViewport}
			<Dialog.Viewport data-testid="viewport">
				{@render popup()}
			</Dialog.Viewport>
		{:else}
			{@render popup()}
		{/if}
	</Dialog.Portal>
</Dialog.Root>
<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="trigger-id">{triggerId ?? ''}</output>
<output data-testid="roots">{root && innerRoot ? 'bound' : ''}</output>
<output data-testid="popups">{outerPopup && innerPopup ? 'attached' : ''}</output>

{#snippet popup()}
	<Dialog.Popup data-testid="popup" {initialFocus} {finalFocus} {@attach captureOuter}>
		<Dialog.Title>{title}</Dialog.Title>
		<Dialog.Description>{description}</Dialog.Description>
		<button type="button">Inside</button>
		<Dialog.Close>Close</Dialog.Close>
		{#if nestedValue}
			<Dialog.Root>
				<Dialog.Trigger>Nested</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Popup data-testid="nested-popup">
						<Dialog.Title>Nested title</Dialog.Title>
						<Dialog.Close>Nested close</Dialog.Close>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		{:else if scenario === 'nested-open'}
			<Dialog.Root bind:this={innerRoot} bind:open={innerOpen} onOpenChange={record}>
				<Dialog.Trigger>Nested</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Popup data-testid="nested-popup" {@attach captureInner}>
						<Dialog.Title>Nested title</Dialog.Title>
						<button type="button">Nested inside</button>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		{:else if scenario === 'nested-popover'}
			<Popover.Root bind:this={innerRoot} bind:open={innerOpen} onOpenChange={record}>
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
{/snippet}
