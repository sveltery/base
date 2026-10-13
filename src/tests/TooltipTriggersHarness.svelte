<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		Tooltip,
		type TooltipHandle,
		type TooltipPositionerProps,
		type TooltipRootProps,
		type TooltipTriggerHostProps,
		type TooltipTriggerProps
	} from '#lib';

	let {
		mode = 'detached',
		handle: givenHandle,
		triggerCount = 2,
		triggerProps = { delay: 0, style: 'pointer-events: none' },
		perTrigger = {},
		hidden = [],
		rootProps = {},
		rootMounted = true,
		rootFirst = false,
		nesting = 0,
		positionerProps = {},
		withViewport = false,
		bound = false
	}: {
		mode?: 'contained' | 'detached';
		handle?: TooltipHandle<unknown>;
		triggerCount?: number;
		triggerProps?: TooltipTriggerProps;
		/** Props for one trigger by number, merged over `triggerProps`. */
		perTrigger?: Record<number, TooltipTriggerProps & { as?: 'disabled-button' | 'custom-id' }>;
		/** Trigger numbers that are not rendered. */
		hidden?: number[];
		rootProps?: TooltipRootProps;
		rootMounted?: boolean;
		rootFirst?: boolean;
		nesting?: number;
		positionerProps?: TooltipPositionerProps;
		withViewport?: boolean;
		/** Binds `open` and `triggerId` and renders buttons that set them. */
		bound?: boolean;
	} = $props();

	const ownHandle = Tooltip.createHandle();
	const handle = $derived(givenHandle ?? ownHandle);
	const detached = $derived(mode === 'detached');
	const numbers = $derived(
		Array.from({ length: triggerCount }, (_, index) => index + 1).filter(
			(number) => !hidden.includes(number)
		)
	);

	let open = $state(false);
	let triggerId = $state<string | null | undefined>(null);
</script>

{#snippet disabledButton(
	props: TooltipTriggerHostProps,
	_state: unknown,
	children: Snippet | undefined
)}
	<button {...props} type="button" disabled>{@render children?.()}</button>
{/snippet}

{#snippet customId(props: TooltipTriggerHostProps, _state: unknown, children: Snippet | undefined)}
	<button {...props} id="custom-button" type="button">{@render children?.()}</button>
{/snippet}

{#snippet triggerList()}
	{#each numbers as number (number)}
		{@const { as, ...own } = perTrigger[number] ?? {}}
		<Tooltip.Trigger
			{...triggerProps}
			handle={detached ? handle : undefined}
			id="trigger-{number}"
			data-testid="trigger-{number}"
			payload={number}
			render={as === 'disabled-button' ? disabledButton : as === 'custom-id' ? customId : undefined}
			{...own}
		>
			Trigger {number}
		</Tooltip.Trigger>
	{/each}
{/snippet}

{#snippet nested(level: number)}
	{#if level > 0}
		<div>{@render nested(level - 1)}</div>
	{:else}
		{@render triggerList()}
	{/if}
{/snippet}

{#snippet body(payload: unknown)}
	{#if !detached}{@render nested(nesting)}{/if}
	<span data-testid="root-payload">{payload === undefined ? 'No payload' : String(payload)}</span>
	<Tooltip.Portal>
		<Tooltip.Positioner data-testid="positioner" {...positionerProps}>
			<Tooltip.Popup data-testid="popup">
				{#if withViewport}
					<Tooltip.Viewport><span data-testid="content">{String(payload)}</span></Tooltip.Viewport>
				{:else}
					<span data-testid="content">{String(payload)}</span>
				{/if}
			</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
{/snippet}

{#snippet root()}
	{#if rootMounted}
		{#if bound}
			<Tooltip.Root handle={detached ? handle : undefined} {...rootProps} bind:open bind:triggerId>
				{#snippet children({ payload })}{@render body(payload)}{/snippet}
			</Tooltip.Root>
		{:else}
			<Tooltip.Root handle={detached ? handle : undefined} {...rootProps}>
				{#snippet children({ payload })}{@render body(payload)}{/snippet}
			</Tooltip.Root>
		{/if}
	{/if}
{/snippet}

<div style="margin: 50px">
	{#if detached && !rootFirst}{@render nested(nesting)}{/if}
	{@render root()}
	{#if detached && rootFirst}{@render nested(nesting)}{/if}
	{#if bound}
		<button
			type="button"
			onclick={() => {
				open = true;
				triggerId = 'trigger-1';
			}}
		>
			Open Trigger 1
		</button>
		<button
			type="button"
			onclick={() => {
				open = true;
				triggerId = 'trigger-2';
			}}
		>
			Open Trigger 2
		</button>
		<button type="button" onclick={() => (open = false)}>Close externally</button>
	{/if}
</div>
