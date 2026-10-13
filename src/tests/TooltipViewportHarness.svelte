<script lang="ts">
	import { untrack } from 'svelte';
	import {
		DirectionProvider,
		Tooltip,
		type TextDirection,
		type TooltipPositionerProps,
		type TooltipRootProps
	} from '#lib';

	interface TriggerEntry {
		/** Changing it remounts the trigger. */
		key?: string;
		payload?: unknown;
		testid?: string;
		label: string;
		id?: string;
		style?: string;
	}

	let {
		rootProps = {},
		triggers = [{ label: 'Trigger' }],
		keepMounted = false,
		positionerProps = {},
		content = 'text',
		direction = 'ltr',
		bound = false,
		initiallyOpen = false
	}: {
		rootProps?: TooltipRootProps;
		triggers?: TriggerEntry[];
		keepMounted?: boolean;
		positionerProps?: TooltipPositionerProps;
		content?: 'static' | 'images' | 'text' | 'payload-div';
		direction?: TextDirection;
		/** Binds `open` and renders a button that closes the tooltip. */
		bound?: boolean;
		initiallyOpen?: boolean;
	} = $props();

	let open = $state(untrack(() => initiallyOpen));
</script>

{#snippet parts(payload: unknown)}
	{#each triggers as entry, index (entry.key ?? entry.id ?? index)}
		<Tooltip.Trigger
			delay={0}
			id={entry.id}
			payload={entry.payload}
			data-testid={entry.testid}
			style={entry.style}
		>
			{entry.label}
		</Tooltip.Trigger>
	{/each}
	<Tooltip.Portal {keepMounted}>
		<Tooltip.Positioner {...positionerProps}>
			<Tooltip.Popup data-testid="popup">
				<Tooltip.Viewport data-testid="viewport">
					{#if content === 'static'}
						<div data-testid="content">Content</div>
					{:else if content === 'images'}
						{#if payload === 'first'}
							<img data-testid="payload-image-1" src="about:blank" alt="Preview 1" />
						{/if}
						{#if payload === 'second'}
							<img data-testid="payload-image-2" src="about:blank" alt="Preview 2" />
						{/if}
					{:else if content === 'payload-div'}
						<div data-testid="content">Content {payload}</div>
					{:else}
						Content {String(payload)}
					{/if}
				</Tooltip.Viewport>
			</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
{/snippet}

<DirectionProvider {direction}>
	{#if bound}
		<Tooltip.Root {...rootProps} bind:open>
			{#snippet children({ payload })}{@render parts(payload)}{/snippet}
		</Tooltip.Root>
		<button type="button" onclick={() => (open = false)}>Close externally</button>
	{:else}
		<Tooltip.Root {...rootProps}>
			{#snippet children({ payload })}{@render parts(payload)}{/snippet}
		</Tooltip.Root>
	{/if}
</DirectionProvider>
