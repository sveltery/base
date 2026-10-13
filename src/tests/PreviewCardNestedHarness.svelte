<script lang="ts">
	import { PreviewCard } from '#lib';

	let {
		parentOpen = $bindable(true),
		childOpen = $bindable(false)
	}: {
		parentOpen?: boolean;
		childOpen?: boolean;
	} = $props();
</script>

<button type="button" data-testid="outside">Outside</button>
<PreviewCard.Root bind:open={parentOpen}>
	<PreviewCard.Trigger href="#" data-testid="parent-trigger">Parent</PreviewCard.Trigger>
	<PreviewCard.Portal>
		<PreviewCard.Positioner data-testid="parent-positioner">
			<PreviewCard.Popup data-testid="parent-popup">
				<div>Parent content</div>
				<PreviewCard.Root bind:open={childOpen}>
					<PreviewCard.Trigger href="#" data-testid="child-trigger">Child</PreviewCard.Trigger>
					<PreviewCard.Portal>
						<PreviewCard.Positioner data-testid="child-positioner">
							<PreviewCard.Popup data-testid="child-popup">Child content</PreviewCard.Popup>
						</PreviewCard.Positioner>
					</PreviewCard.Portal>
				</PreviewCard.Root>
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
</PreviewCard.Root>
