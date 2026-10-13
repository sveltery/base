<script lang="ts">
	import { DirectionProvider, PreviewCard } from '#lib';
	import type { PreviewCardPositionerProps } from '#lib';

	let {
		open = $bindable(true),
		direction = 'ltr',
		viewport = false,
		fixedBottom = false,
		popupStyle = 'width: 52px; height: 24px',
		...positioner
	}: Pick<
		PreviewCardPositionerProps,
		'side' | 'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding' | 'collisionAvoidance'
	> & {
		open?: boolean;
		direction?: 'ltr' | 'rtl';
		viewport?: boolean;
		fixedBottom?: boolean;
		popupStyle?: string;
	} = $props();
</script>

<DirectionProvider {direction}>
	<div style={fixedBottom ? 'position: fixed; bottom: 8px; left: 16px' : undefined}>
		<PreviewCard.Root bind:open>
			<PreviewCard.Trigger
				href="#"
				data-testid="trigger"
				style="display: block; width: 72px; height: 36px; box-sizing: border-box"
			>
				Trigger
			</PreviewCard.Trigger>
			<PreviewCard.Portal>
				<PreviewCard.Positioner data-testid="positioner" {...positioner}>
					<PreviewCard.Popup data-testid="popup" style={popupStyle}>
						{#if viewport}
							<PreviewCard.Viewport>Popup</PreviewCard.Viewport>
						{:else}
							Popup
						{/if}
					</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		</PreviewCard.Root>
	</div>
</DirectionProvider>
