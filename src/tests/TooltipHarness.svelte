<script lang="ts">
	import {
		Tooltip,
		type TooltipActions,
		type TooltipPopupProps,
		type TooltipPortalProps,
		type TooltipPositionerProps,
		type TooltipRootProps,
		type TooltipTriggerProps
	} from '#lib';

	let {
		mode = 'contained',
		rootProps = {},
		triggerProps = {},
		portalProps = {},
		positionerProps = {},
		popupProps = {},
		bound = false,
		open = $bindable(false),
		locked = false,
		showTrigger = true,
		content = 'Content',
		label = 'Toggle'
	}: {
		mode?: 'contained' | 'detached' | 'multiple';
		rootProps?: TooltipRootProps;
		triggerProps?: TooltipTriggerProps;
		portalProps?: TooltipPortalProps;
		positionerProps?: TooltipPositionerProps;
		popupProps?: TooltipPopupProps;
		bound?: boolean;
		open?: boolean;
		/** Binds `open` to a value the root cannot change, like upstream's `open={true}`. */
		locked?: boolean;
		showTrigger?: boolean;
		content?: string;
		label?: string;
	} = $props();

	const handle = Tooltip.createHandle();
	const detached = $derived(mode !== 'contained');

	let root = $state<TooltipActions | undefined>(undefined);

	export function getOpen() {
		return open;
	}

	export function close() {
		root?.close();
	}

	export function unmount() {
		root?.unmount();
	}
</script>

{#snippet trigger()}
	{#if showTrigger}
		<Tooltip.Trigger data-testid="trigger" handle={detached ? handle : undefined} {...triggerProps}>
			{label}
		</Tooltip.Trigger>
	{/if}
	{#if mode === 'multiple'}
		<Tooltip.Trigger data-testid="trigger-2" {handle}>Toggle another</Tooltip.Trigger>
	{/if}
{/snippet}

{#snippet portal()}
	<Tooltip.Portal {...portalProps}>
		<Tooltip.Positioner data-testid="positioner" {...positionerProps}>
			<Tooltip.Popup data-testid="popup" {...popupProps}>{content}</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
{/snippet}

{#snippet parts()}
	{#if !detached}{@render trigger()}{/if}
	{@render portal()}
{/snippet}

{#if detached}{@render trigger()}{/if}
{#if locked}
	<Tooltip.Root
		bind:this={root}
		handle={detached ? handle : undefined}
		{...rootProps}
		bind:open={() => true, () => {}}
	>
		{@render parts()}
	</Tooltip.Root>
{:else if bound}
	<Tooltip.Root bind:this={root} handle={detached ? handle : undefined} {...rootProps} bind:open>
		{@render parts()}
	</Tooltip.Root>
{:else}
	<Tooltip.Root bind:this={root} handle={detached ? handle : undefined} {...rootProps}>
		{@render parts()}
	</Tooltip.Root>
{/if}
