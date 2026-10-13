<script lang="ts">
	import { PreviewCard, type PreviewCardHandle } from '#lib';

	let {
		handle,
		phase = 'outgoing',
		onOpenError
	}: {
		handle: PreviewCardHandle<number>;
		phase?: 'outgoing' | 'overlap' | 'incoming';
		onOpenError?: (error: unknown) => void;
	} = $props();
</script>

{#snippet openOnMount()}
	{@const open = () => {
		try {
			handle.open('trigger-2');
		} catch (error) {
			onOpenError?.(error);
		}
	}}
	<span {@attach () => open()}></span>
{/snippet}

{#snippet card(key: string)}
	<PreviewCard.Root {handle}>
		<PreviewCard.Portal>
			<PreviewCard.Positioner>
				<PreviewCard.Popup data-testid="popup-{key}">{key}</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{/snippet}

{#each [1, 2] as number (number)}
	<PreviewCard.Trigger {handle} href="#" id="trigger-{number}" data-testid="trigger-{number}">
		Trigger {number}
	</PreviewCard.Trigger>
{/each}
{#if phase === 'outgoing' || phase === 'overlap'}
	{@render card('outgoing')}
{/if}
{#if phase === 'overlap' || phase === 'incoming'}
	{@render card('incoming')}
	{@render openOnMount()}
{/if}
