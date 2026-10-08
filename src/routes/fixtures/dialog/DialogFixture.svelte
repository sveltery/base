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
		innerOpen = $bindable(true),
		openInnerFromEffect = false,
		container = undefined as HTMLElement | ShadowRoot | null | undefined
	} = $props();

	let root = $state<DialogActions | undefined>(undefined);
	let innerRoot = $state<DialogActions | PopoverActions | undefined>(undefined);
	let outerPopup = $state<HTMLElement | undefined>(undefined);
	let innerPopup = $state<HTMLElement | undefined>(undefined);
	let finalTarget = $state<HTMLElement | null>(null);
	let outsideButton = $state<HTMLButtonElement | null>(null);
	let parentOpen = $state(false);

	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);

	function pageBody(): HTMLElement | undefined {
		if (typeof document === 'undefined') return undefined;
		return document.body;
	}

	function holdFinal(node: HTMLElement) {
		finalTarget = node;
		return () => {
			if (finalTarget === node) finalTarget = null;
		};
	}

	const modalValue = $derived(modal ?? (scenario === 'outside' ? false : true));
	const disabledValue = $derived(disabled ?? scenario === 'disabled');
	const nestedValue = $derived(nested ?? scenario === 'nested');
	const alreadyOpen = $derived(scenario === 'nested-open' || scenario === 'nested-popover');
	const backdrop = $derived(
		withBackdrop ??
			(scenario !== 'outside' &&
				scenario !== 'nested' &&
				scenario !== 'nested-onto' &&
				!alreadyOpen)
	);

	// Opens the child after the parent popup's focus frame is queued.
	$effect(() => {
		if (openInnerFromEffect) innerOpen = true;
	});
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

<button type="button" data-testid="outside" bind:this={outsideButton}>Outside</button>
{#if preventUnmount}
	<button type="button" onclick={() => root?.unmount()}>Unmount</button>
{/if}

{#snippet nestedChild(body: boolean, nonModal: boolean, skipFocus: boolean, blockPointer: boolean)}
	<Dialog.Root
		modal={nonModal ? false : undefined}
		disablePointerDismissal={blockPointer ? true : undefined}
	>
		<Dialog.Trigger>Nested</Dialog.Trigger>
		<Dialog.Portal container={body ? pageBody() : undefined}>
			<Dialog.Popup data-testid="nested-popup" initialFocus={skipFocus ? false : undefined}>
				<Dialog.Title>Nested title</Dialog.Title>
				<button type="button" data-testid="nested-inside">Nested inside</button>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{/snippet}

{#if scenario === 'nested-body'}
	<Dialog.Root modal={false} onOpenChange={changed}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="parent-popup">
				<Dialog.Title>Title</Dialog.Title>
				<button type="button">Inside</button>
				{@render nestedChild(true, true, false, false)}
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if scenario === 'final-focus'}
	<button type="button" data-testid="final-target" {@attach holdFinal}>Land here</button>
	<Dialog.Root modal={false} onOpenChange={changed}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="parent-popup">
				<Dialog.Title>Title</Dialog.Title>
				<Dialog.Root modal={false}>
					<Dialog.Trigger>Nested</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup data-testid="nested-popup" finalFocus={() => finalTarget}>
							<Dialog.Title>Nested title</Dialog.Title>
							<Dialog.Close>Nested close</Dialog.Close>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if scenario === 'child-initial'}
	<Dialog.Root onOpenChange={changed}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="parent-popup">
				<Dialog.Title>Title</Dialog.Title>
				<button type="button" data-testid="parent-inside">Inside</button>
				{@render nestedChild(true, false, true, false)}
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if scenario === 'siblings'}
	<Dialog.Root modal={false} defaultOpen>
		<Dialog.Trigger>Open A</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="popup-a" initialFocus={false}>
				<Dialog.Title>A</Dialog.Title>
				<button type="button" data-testid="inside-a">Inside A</button>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
	<Dialog.Root modal={false} defaultOpen>
		<Dialog.Trigger>Open B</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="popup-b" initialFocus={false}>
				<Dialog.Title>B</Dialog.Title>
				<button type="button" data-testid="inside-b">Inside B</button>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if scenario === 'final-outside'}
	<Dialog.Root modal={false} onOpenChange={changed}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup data-testid="parent-popup">
				<Dialog.Title>Title</Dialog.Title>
				<button type="button" data-testid="parent-inside">Inside</button>
				<Dialog.Root modal={false}>
					<Dialog.Trigger>Nested</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup data-testid="nested-popup" finalFocus={() => outsideButton}>
							<Dialog.Title>Nested title</Dialog.Title>
							<button type="button" data-testid="nested-inside">Nested inside</button>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if scenario === 'tab'}
	<button type="button" data-testid="before">Before</button>
	<Dialog.Root modal={false} onOpenChange={changed}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup>
				<Dialog.Title>Title</Dialog.Title>
				<button type="button">Inside</button>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
	<button type="button" data-testid="after">After</button>
{:else if scenario === 'kept-child'}
	<Dialog.Root bind:open={parentOpen}>
		<Dialog.Trigger data-testid="open-parent">Open</Dialog.Trigger>
		<Dialog.Portal keepMounted>
			<Dialog.Popup data-testid="parent-popup">
				<Dialog.Title>Title</Dialog.Title>
				<button type="button" data-testid="parent-inside">Inside</button>
				{@render nestedChild(false, false, false, true)}
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
	<button type="button" data-testid="force-close" onclick={() => (parentOpen = false)}
		>Force close</button
	>
{:else}
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
		<Dialog.Portal {keepMounted} {container}>
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
{/if}
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
		{:else if scenario === 'nested-open' || scenario === 'nested-onto'}
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
