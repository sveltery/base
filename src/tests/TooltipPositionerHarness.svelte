<script lang="ts">
	import {
		DirectionProvider,
		Tooltip,
		type TextDirection,
		type TooltipPositionerProps
	} from '#lib';

	let {
		positioner = {},
		popupStyle = 'width: 52px; height: 24px',
		open = true,
		viewport = false,
		wrapperStyle = 'position: fixed; top: 0; left: 0',
		direction = 'ltr',
		toggle = false
	}: {
		positioner?: TooltipPositionerProps;
		popupStyle?: string;
		open?: boolean;
		viewport?: boolean;
		wrapperStyle?: string;
		direction?: TextDirection;
		/** Renders a button that toggles the Viewport. */
		toggle?: boolean;
	} = $props();

	let showViewport = $state(false);
	const withViewport = $derived(viewport || showViewport);
</script>

<DirectionProvider {direction}>
	<div style={wrapperStyle}>
		<Tooltip.Root {open}>
			<Tooltip.Trigger
				style="width: 72px; height: 36px; box-sizing: border-box; padding: 0; border: 0"
			>
				Trigger
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner data-testid="positioner" {...positioner}>
					<Tooltip.Popup style={popupStyle}>
						{#if withViewport}<Tooltip.Viewport>Popup</Tooltip.Viewport>{:else}Popup{/if}
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
	{#if toggle}
		<button type="button" onclick={() => (showViewport = !showViewport)}>Toggle Viewport</button>
	{/if}
</DirectionProvider>
