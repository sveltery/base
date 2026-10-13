<script lang="ts">
	import { PreviewCard, type PreviewCardActions, type PreviewCardChangeEventDetails } from '#lib';

	let {
		mode = 'contained',
		open = $bindable(),
		triggerId = $bindable(),
		onOpenChange,
		onOpenChangeComplete,
		delay,
		closeDelay,
		keepMounted = false,
		withArrow = false,
		withBackdrop = false,
		popupClass
	}: {
		mode?: 'contained' | 'detached' | 'multiple';
		open?: boolean;
		triggerId?: string | null;
		onOpenChange?: (open: boolean, details: PreviewCardChangeEventDetails) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		delay?: number;
		closeDelay?: number;
		keepMounted?: boolean;
		withArrow?: boolean;
		withBackdrop?: boolean;
		popupClass?: string;
	} = $props();

	const handle = PreviewCard.createHandle();
	let root = $state<PreviewCardActions | undefined>(undefined);
</script>

<button type="button" onclick={() => root?.close()}>Call close</button>
<button type="button" onclick={() => root?.unmount()}>Call unmount</button>
<button type="button" onclick={() => (open = true)}>Show</button>

{#snippet popup()}
	<PreviewCard.Portal {keepMounted}>
		{#if withBackdrop}<PreviewCard.Backdrop data-testid="backdrop" />{/if}
		<PreviewCard.Positioner data-testid="positioner">
			<PreviewCard.Popup data-testid="popup" class={popupClass}>
				Content
				{#if withArrow}<PreviewCard.Arrow data-testid="arrow" />{/if}
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
{/snippet}

{#if mode === 'contained'}
	<PreviewCard.Root bind:this={root} bind:open bind:triggerId {onOpenChange} {onOpenChangeComplete}>
		<PreviewCard.Trigger href="#" data-testid="trigger" {delay} {closeDelay}
			>Link</PreviewCard.Trigger
		>
		{@render popup()}
	</PreviewCard.Root>
{:else}
	<PreviewCard.Trigger href="#" data-testid="trigger" {handle} {delay} {closeDelay}>
		Link
	</PreviewCard.Trigger>
	{#if mode === 'multiple'}
		<PreviewCard.Trigger href="#" data-testid="trigger-2" {handle}>Another link</PreviewCard.Trigger
		>
	{/if}
	<PreviewCard.Root
		bind:this={root}
		{handle}
		bind:open
		bind:triggerId
		{onOpenChange}
		{onOpenChangeComplete}
	>
		{@render popup()}
	</PreviewCard.Root>
{/if}
