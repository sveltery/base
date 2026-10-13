<script lang="ts">
	import { Tooltip, type TrackCursorAxis } from '#lib';

	let { trackCursorAxis = 'x' }: { trackCursorAxis?: TrackCursorAxis } = $props();
</script>

<div style="padding-top: 100px; padding-left: 40px">
	<Tooltip.Root {trackCursorAxis}>
		<Tooltip.Trigger delay={100} style="width: 300px; height: 40px">Trigger</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner data-testid="positioner" side="bottom">
				<Tooltip.Popup style="width: 40px; height: 20px">Tooltip</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</div>
