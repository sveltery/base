<script lang="ts">
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
	let ownerId = $state<string | null | undefined>(undefined);
	const reviewHandle = handle ?? Popover.createHandle();
	const detached = mode === 'handle' || mode === 'viewport';
</script>

{#if mode === 'focus'}
	<button type="button" data-testid="final" bind:this={finalEl}>Final</button>
	<span data-testid="focus-calls">{focusCalls}</span>
{:else if mode === 'trigger'}
	<pre data-testid="trigger-id">{ownerId ?? ''}</pre>
{:else if mode === 'handle'}
	<pre data-testid="handle-open">{reviewHandle.isOpen ? 'yes' : 'no'}</pre>
{/if}

{#if mode === 'viewport'}
	<Popover.Trigger handle={reviewHandle} id="trigger-a" payload="content-AAA">One</Popover.Trigger>
	<Popover.Trigger handle={reviewHandle} id="trigger-b" payload="content-BBB">Two</Popover.Trigger>
{:else if mode === 'handle'}
	<Popover.Trigger handle={reviewHandle} id="module-trigger">Open</Popover.Trigger>
{/if}

<Popover.Root
	handle={detached ? reviewHandle : undefined}
	defaultOpen={mode === 'default-open'}
	bind:triggerId={ownerId}
>
	{#snippet children({ payload })}
		{#if !detached}
			<Popover.Trigger id={mode === 'trigger' ? 'owned' : undefined}>Open</Popover.Trigger>
		{/if}
		<Popover.Portal keepMounted={mode === 'mounted'}>
			<Popover.Positioner data-testid={mode === 'mounted' ? 'positioner' : undefined}>
				{#if mode === 'focus'}
					{@render focusPopup()}
				{:else if mode === 'viewport'}
					{@render viewportPopup(payload)}
				{:else if mode === 'default-open'}
					<Popover.Popup>Ready</Popover.Popup>
				{:else}
					{@render plainPopup()}
				{/if}
			</Popover.Positioner>
		</Popover.Portal>
	{/snippet}
</Popover.Root>

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

{#snippet viewportPopup(payload: unknown)}
	<Popover.Popup>
		<Popover.Viewport>
			<p data-testid="pane-text">{payload}</p>
			<h2 id="live-title">Live</h2>
			<input data-testid="live-input" />
			<input type="radio" name="pane-choice" data-testid="live-radio" />
		</Popover.Viewport>
	</Popover.Popup>
{/snippet}
