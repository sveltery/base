<script lang="ts">
	import { PreviewCard } from '#lib';

	let {
		case: scenario
	}: {
		case:
			| 'popup-without-root'
			| 'popup-without-positioner'
			| 'trigger-without-root'
			| 'viewport-without-positioner'
			| 'positioner-without-portal';
	} = $props();
</script>

{#if scenario === 'popup-without-root'}
	<PreviewCard.Popup />
{:else if scenario === 'popup-without-positioner'}
	<PreviewCard.Root open>
		<PreviewCard.Portal>
			<PreviewCard.Popup />
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else if scenario === 'trigger-without-root'}
	<PreviewCard.Trigger />
{:else if scenario === 'viewport-without-positioner'}
	<PreviewCard.Root open>
		<PreviewCard.Portal>
			<PreviewCard.Viewport />
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else}
	<PreviewCard.Root open>
		<PreviewCard.Positioner>
			<PreviewCard.Popup />
		</PreviewCard.Positioner>
	</PreviewCard.Root>
{/if}
