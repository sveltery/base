<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Popover, type PopoverHandle } from '#lib';

	let {
		mode,
		handle
	}: {
		mode: 'focus' | 'mounted' | 'viewport' | 'trigger' | 'default-open' | 'handle';
		handle?: PopoverHandle;
	} = $props();

	let focusCalls = $state(0);
	let finalEl = $state<HTMLButtonElement | null>(null);
	let ownerId = $state<string | null>(null);
	const reviewHandle = handle ?? Popover.createHandle();
</script>

{#snippet frame(extra: Snippet)}
	<Popover.Portal keepMounted={mode === 'mounted'}>
		<Popover.Positioner data-testid={mode === 'mounted' ? 'positioner' : undefined}>
			{@render extra()}
		</Popover.Positioner>
	</Popover.Portal>
{/snippet}

{#if mode === 'focus'}
	<button type="button" data-testid="final" bind:this={finalEl}>Final</button>
	<span data-testid="focus-calls">{focusCalls}</span>
	<Popover.Root>
		<Popover.Trigger>Open</Popover.Trigger>
		{@render frame(focusPopup)}
	</Popover.Root>
{:else if mode === 'mounted'}
	<Popover.Root>
		<Popover.Trigger>Open</Popover.Trigger>
		{@render frame(plainPopup)}
	</Popover.Root>
{:else if mode === 'default-open'}
	<Popover.Root defaultOpen>
		<Popover.Trigger>Open</Popover.Trigger>
		{@render frame(readyPopup)}
	</Popover.Root>
{:else if mode === 'trigger'}
	<pre data-testid="trigger-id">{ownerId ?? ''}</pre>
	<Popover.Root bind:triggerId={ownerId}>
		<Popover.Trigger id="owned">Open</Popover.Trigger>
		{@render frame(ownedPopup)}
	</Popover.Root>
{:else if mode === 'handle'}
	<pre data-testid="handle-open">{reviewHandle.isOpen ? 'yes' : 'no'}</pre>
	<Popover.Trigger handle={reviewHandle} id="module-trigger">Open</Popover.Trigger>
	<Popover.Root handle={reviewHandle}>
		{@render frame(plainPopup)}
	</Popover.Root>
{:else}
	<Popover.Trigger handle={reviewHandle} id="trigger-a">One</Popover.Trigger>
	<Popover.Trigger handle={reviewHandle} id="trigger-b">Two</Popover.Trigger>
	<button type="button" onclick={() => reviewHandle.open('trigger-b')}>Switch</button>
	<Popover.Root handle={reviewHandle}>
		{@render frame(viewportPopup)}
	</Popover.Root>
{/if}

{#snippet focusPopup()}
	<Popover.Popup
		initialFocus={() => {
			focusCalls += 1;
			return true;
		}}
		finalFocus={() => finalEl}
	>
		<button type="button">Inside</button>
	</Popover.Popup>
{/snippet}

{#snippet plainPopup()}
	<Popover.Popup>
		<button type="button">Inside</button>
	</Popover.Popup>
{/snippet}

{#snippet readyPopup()}
	<Popover.Popup>Ready</Popover.Popup>
{/snippet}

{#snippet ownedPopup()}
	<Popover.Popup>Owned</Popover.Popup>
{/snippet}

{#snippet viewportPopup()}
	<Popover.Popup>
		<Popover.Viewport>
			<h2 id="live-title">Live</h2>
			<input data-testid="live-input" />
		</Popover.Viewport>
	</Popover.Popup>
{/snippet}
