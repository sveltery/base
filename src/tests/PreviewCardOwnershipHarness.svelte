<script lang="ts">
	import { PreviewCard, type PreviewCardActions, type PreviewCardChangeEventDetails } from '#lib';

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
		onOpenChange?: (open: boolean, details: PreviewCardChangeEventDetails) => void;
		onOpenChangeComplete?: (open: boolean) => void;
	} = $props();

	const handle = PreviewCard.createHandle<string>();
	let root = $state<PreviewCardActions | undefined>(undefined);

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
		<PreviewCard.Trigger
			href="#"
			data-testid="trigger"
			handle={detached ? handle : undefined}
			payload="from trigger"
			delay={0}
		>
			Toggle
		</PreviewCard.Trigger>
	{/if}
{/snippet}

{#if detached}{@render trigger()}{/if}
{#if showRoot}
	<PreviewCard.Root
		bind:this={root}
		handle={detached ? handle : undefined}
		bind:open
		{onOpenChange}
		{onOpenChangeComplete}
	>
		{#snippet children({ payload })}
			{#if !detached}{@render trigger()}{/if}
			<PreviewCard.Portal>
				<PreviewCard.Positioner data-testid="positioner">
					<PreviewCard.Popup data-testid="popup">Payload: {payload ?? 'none'}</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		{/snippet}
	</PreviewCard.Root>
{/if}
