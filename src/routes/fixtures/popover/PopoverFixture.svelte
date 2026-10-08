<script lang="ts">
	import { Popover, type PopoverChangeEventDetails } from '#lib';
	import type { PopoverCase } from './cases.js';

	let { scenario }: { scenario: PopoverCase } = $props();

	let owner = $state(scenario === 'open');
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);
	let inlineContainer = $state<HTMLDivElement | null>(null);
	let externalOpen = $state(false);
	const handle = Popover.createHandle();
	const bound = $derived(scenario === 'bound' || scenario === 'open');

	function changed(open: boolean, details: PopoverChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ open, reason: details.reason, canceled: details.isCanceled });
		if (bound && !details.isCanceled) owner = open;
	}

	function clicked(event: MouseEvent) {
		if (scenario === 'prevented') event.preventBaseUIHandler?.();
	}
</script>

<button type="button">Outside</button>
<input data-testid="outside-input" />
<pre data-testid="calls">{JSON.stringify(calls)}</pre>

{#snippet popup()}
	<Popover.Portal
		container={scenario === 'tab-inline' || scenario === 'tab-between-ext'
			? inlineContainer
			: undefined}
	>
		<Popover.Positioner>
			<Popover.Popup>
				<Popover.Title>Title</Popover.Title>
				Content
				{#if scenario === 'tab-between-ext'}
					<button type="button">Inside1</button>
					<button type="button">Inside2</button>
				{:else if scenario !== 'tab-empty'}
					<button type="button">Inside</button>
				{/if}
				{#if scenario === 'close' || scenario === 'modal'}
					<Popover.Close>Close</Popover.Close>
				{/if}
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
{/snippet}

{#if scenario === 'detached'}
	<Popover.Trigger {handle} id="detached-trigger" onclick={clicked}>Open</Popover.Trigger>
	<Popover.Root {handle} onOpenChange={changed}>
		{@render popup()}
	</Popover.Root>
{:else if bound}
	<Popover.Root bind:open={owner} modal={scenario === 'modal'} onOpenChange={changed}>
		<Popover.Trigger onclick={clicked}>Open</Popover.Trigger>
		{@render popup()}
	</Popover.Root>
{:else if scenario === 'tab-ext' || scenario === 'tab-between-ext'}
	<button type="button" data-testid="before">Before</button>
	<button type="button" data-testid="ext" onclick={() => (externalOpen = true)}>Ext</button>
	<Popover.Root bind:open={externalOpen} onOpenChange={changed}>
		<Popover.Trigger>Open</Popover.Trigger>
		{#if scenario === 'tab-between-ext'}
			<div data-testid="inline-container" bind:this={inlineContainer}></div>
		{/if}
		{@render popup()}
	</Popover.Root>
	<button type="button" data-testid="after">After</button>
{:else}
	{#if scenario === 'tab' || scenario === 'tab-empty' || scenario === 'tab-inline'}
		<button type="button" data-testid="before">Before</button>
	{/if}
	<Popover.Root modal={scenario === 'modal'} onOpenChange={changed}>
		<Popover.Trigger
			onclick={clicked}
			disabled={scenario === 'disabled'}
			openOnHover={scenario === 'hover'}
			delay={0}
		>
			Open
		</Popover.Trigger>
		{@render popup()}
	</Popover.Root>
{/if}
{#if scenario === 'tab-inline'}
	<div data-testid="inline-container" bind:this={inlineContainer}></div>
{/if}
{#if scenario === 'tab' || scenario === 'tab-empty' || scenario === 'tab-inline'}
	<button type="button" data-testid="after">After</button>
{/if}
