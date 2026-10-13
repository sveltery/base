<script lang="ts">
	import { PreviewCard, type PreviewCardChangeEventDetails, type PreviewCardHandle } from '#lib';

	let {
		mode = 'detached',
		handle = PreviewCard.createHandle<number>(),
		triggerCount = 2,
		delay = 0,
		closeDelay = 0,
		secondDelay,
		open = $bindable(),
		triggerId = $bindable(),
		onOpenChange,
		onOpenChangeComplete,
		rootMounted = true,
		rootFirst = false,
		withViewport = false,
		keepMounted = false,
		showFirst = true,
		nesting = 0,
		side = 'bottom',
		align = 'start',
		popupClass
	}: {
		mode?: 'contained' | 'detached';
		handle?: PreviewCardHandle<number>;
		triggerCount?: number;
		delay?: number;
		closeDelay?: number;
		secondDelay?: number;
		open?: boolean;
		triggerId?: string | null;
		onOpenChange?: (open: boolean, details: PreviewCardChangeEventDetails) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		rootMounted?: boolean;
		rootFirst?: boolean;
		withViewport?: boolean;
		keepMounted?: boolean;
		showFirst?: boolean;
		nesting?: number;
		side?: 'top' | 'bottom' | 'left' | 'right';
		align?: 'start' | 'center' | 'end';
		popupClass?: string;
	} = $props();

	const numbers = $derived(Array.from({ length: triggerCount }, (_, index) => index + 1));
	const detached = $derived(mode === 'detached');
</script>

{#snippet trigger(number: number)}
	{#if number !== 1 || showFirst}
		<PreviewCard.Trigger
			handle={detached ? handle : undefined}
			href="#"
			id="trigger-{number}"
			data-testid="trigger-{number}"
			payload={number}
			delay={number === 2 && secondDelay !== undefined ? secondDelay : delay}
			{closeDelay}
			style="pointer-events: none"
		>
			{`Trigger ${number}`}
		</PreviewCard.Trigger>
	{/if}
{/snippet}

{#snippet triggers(level: number)}
	{#if level > 0}
		<div>{@render triggers(level - 1)}</div>
	{:else}
		{#each numbers as number (number)}
			{@render trigger(number)}
		{/each}
	{/if}
{/snippet}

{#snippet popup(payload: number | undefined)}
	<PreviewCard.Portal {keepMounted}>
		<PreviewCard.Positioner data-testid="positioner" {side} {align}>
			<PreviewCard.Popup data-testid="popup" class={popupClass}>
				{#if withViewport}
					<PreviewCard.Viewport>
						<span data-testid="content">{payload}</span>
					</PreviewCard.Viewport>
				{:else}
					<span data-testid="content">{payload}</span>
				{/if}
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
{/snippet}

{#snippet root()}
	{#if rootMounted}
		<PreviewCard.Root
			handle={detached ? handle : undefined}
			bind:open
			bind:triggerId
			{onOpenChange}
			{onOpenChangeComplete}
		>
			{#snippet children({ payload })}
				{#if !detached}{@render triggers(nesting)}{/if}
				<span data-testid="root-payload">{payload === undefined ? 'No payload' : payload}</span>
				{@render popup(payload as number | undefined)}
			{/snippet}
		</PreviewCard.Root>
	{/if}
{/snippet}

{#if !detached}
	{@render root()}
{:else if rootFirst}
	{@render root()}
	{@render triggers(nesting)}
{:else}
	{@render triggers(nesting)}
	{@render root()}
{/if}
