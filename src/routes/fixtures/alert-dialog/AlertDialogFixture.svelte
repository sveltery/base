<script lang="ts">
	import {
		AlertDialog,
		Dialog,
		type AlertDialogActions,
		type AlertDialogChangeEventDetails,
		type AlertDialogHandle,
		type DialogFocusTarget
	} from '#lib';
	import type { AlertDialogCase } from './cases.js';

	let {
		scenario = 'standalone' as AlertDialogCase,
		open = $bindable(undefined as boolean | undefined),
		triggerId = $bindable(undefined as string | null | undefined),
		handle = undefined as AlertDialogHandle<number> | undefined,
		detached = undefined as boolean | undefined,
		triggerCount = undefined as number | undefined,
		rootMounted = true,
		rootFirst = false,
		keepMounted = false,
		withBackdrop = undefined as boolean | undefined,
		withViewport = false,
		popupId = undefined as string | undefined,
		popupClass = undefined as string | undefined,
		initialFocus = undefined as DialogFocusTarget | undefined,
		finalFocus = undefined as DialogFocusTarget | undefined,
		preventUnmount = false,
		holdOpen = false,
		onOpenChange = undefined as
			((open: boolean, details: AlertDialogChangeEventDetails) => void) | undefined,
		onOpenChangeComplete = undefined as ((open: boolean) => void) | undefined
	} = $props();

	let root = $state<AlertDialogActions | undefined>(undefined);
	const ownHandle = AlertDialog.createHandle<number>();
	const isDetached = $derived(detached ?? scenario === 'detached');
	const activeHandle = $derived(handle ?? (isDetached ? ownHandle : undefined));
	const numbered = $derived(activeHandle !== undefined || (triggerCount ?? 1) > 1);
	const initialOpen = $derived(open ?? (scenario === 'open' ? true : undefined));

	// `holdOpen` is a parent that refuses to close, the Svelte form of a controlled `open` that ignores `false`.
	function setOpen(next: boolean) {
		if (holdOpen && !next) return;
		open = next;
	}

	export function close() {
		root?.close();
	}

	export function unmount() {
		root?.unmount();
	}

	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);

	function changed(next: boolean, details: AlertDialogChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		if (preventUnmount && !next) details.preventUnmountOnClose();
		onOpenChange?.(next, details);
		calls.push({ open: next, reason: details.reason, canceled: details.isCanceled });
	}
</script>

<button type="button" data-testid="outside">Outside</button>
{#if preventUnmount}
	<button type="button" onclick={() => root?.unmount()}>Unmount</button>
{/if}

{#snippet triggers()}
	{#if numbered}
		{#each { length: triggerCount ?? 2 }, index (index)}
			<AlertDialog.Trigger
				handle={isDetached ? activeHandle : undefined}
				id={`trigger-${index + 1}`}
				data-testid={`trigger-${index + 1}`}
				payload={index + 1}
			>
				Trigger {index + 1}
			</AlertDialog.Trigger>
		{/each}
	{:else}
		<AlertDialog.Trigger data-testid="trigger">Open</AlertDialog.Trigger>
	{/if}
{/snippet}

{#snippet content(payload: unknown)}
	<AlertDialog.Title>Title</AlertDialog.Title>
	<AlertDialog.Description>Description</AlertDialog.Description>
	<span data-testid="content">{String(payload)}</span>
	<button type="button">Inside</button>
	<AlertDialog.Close>Close</AlertDialog.Close>
{/snippet}

{#snippet popup(payload: unknown)}
	<AlertDialog.Popup
		data-testid="popup"
		{...popupId ? { id: popupId } : {}}
		class={popupClass}
		{initialFocus}
		{finalFocus}
	>
		{@render content(payload)}
	</AlertDialog.Popup>
{/snippet}

{#if scenario === 'nested'}
	<Dialog.Root onOpenChange={(next, details) => changed(next, details)}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="parent-popup">
				<Dialog.Title>Settings</Dialog.Title>
				<AlertDialog.Root>
					<AlertDialog.Trigger>Delete</AlertDialog.Trigger>
					<AlertDialog.Portal>
						<AlertDialog.Popup data-testid="popup">
							<AlertDialog.Title>Confirm</AlertDialog.Title>
							<AlertDialog.Close>Cancel</AlertDialog.Close>
						</AlertDialog.Popup>
					</AlertDialog.Portal>
				</AlertDialog.Root>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	{#if isDetached && !rootFirst}
		{@render triggers()}
	{/if}
	{#if rootMounted}
		<AlertDialog.Root
			bind:this={root}
			bind:open={() => initialOpen, setOpen}
			bind:triggerId
			handle={activeHandle}
			onOpenChange={changed}
			{onOpenChangeComplete}
		>
			{#snippet children({ payload })}
				{#if !isDetached}
					{@render triggers()}
				{/if}
				<span data-testid="root-payload">{payload === undefined ? 'No payload' : payload}</span>
				<AlertDialog.Portal {keepMounted}>
					{#if withBackdrop ?? scenario === 'backdrop'}
						<AlertDialog.Backdrop data-testid="backdrop" />
					{/if}
					{#if withViewport}
						<AlertDialog.Viewport data-testid="viewport"
							>{@render popup(payload)}</AlertDialog.Viewport
						>
					{:else}
						{@render popup(payload)}
					{/if}
				</AlertDialog.Portal>
			{/snippet}
		</AlertDialog.Root>
	{/if}
	{#if isDetached && rootFirst}
		{@render triggers()}
	{/if}
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
