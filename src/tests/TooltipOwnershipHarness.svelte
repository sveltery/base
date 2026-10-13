<script lang="ts">
	import { Tooltip, type TooltipActions, type TooltipChangeEventDetails } from '#lib';

	let {
		detached = false,
		showRoot = true,
		showTrigger = true,
		open = $bindable(false),
		onOpenChange,
		onOpenChangeComplete
	}: {
		detached?: boolean;
		showRoot?: boolean;
		showTrigger?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean, details: TooltipChangeEventDetails) => void;
		onOpenChangeComplete?: (open: boolean) => void;
	} = $props();

	const handle = Tooltip.createHandle<string>();
	let root = $state<TooltipActions | undefined>(undefined);

	export function getOpen() {
		return open;
	}

	export function openWithoutTrigger() {
		handle.open(null);
	}

	export function unmount() {
		root?.unmount();
	}
</script>

{#snippet trigger()}
	{#if showTrigger}
		<Tooltip.Trigger
			data-testid="trigger"
			handle={detached ? handle : undefined}
			payload="from trigger"
			delay={0}
		>
			Toggle
		</Tooltip.Trigger>
	{/if}
{/snippet}

{#if detached}{@render trigger()}{/if}
{#if showRoot}
	<Tooltip.Root
		bind:this={root}
		handle={detached ? handle : undefined}
		bind:open
		{onOpenChange}
		{onOpenChangeComplete}
	>
		{#snippet children({ payload })}
			{#if !detached}{@render trigger()}{/if}
			<Tooltip.Portal>
				<Tooltip.Positioner data-testid="positioner">
					<Tooltip.Popup data-testid="popup">Payload: {payload ?? 'none'}</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		{/snippet}
	</Tooltip.Root>
{/if}
