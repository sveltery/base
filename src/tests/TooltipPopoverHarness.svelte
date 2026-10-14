<script lang="ts">
	import { Popover, Tooltip } from '#lib';

	let tipOpen = $state(true);
</script>

<Tooltip.Root bind:open={tipOpen}>
	<Tooltip.Trigger>Tip</Tooltip.Trigger>
	<Tooltip.Portal>
		<Tooltip.Positioner>
			<Tooltip.Popup data-testid="tip">
				<Popover.Root>
					<Popover.Trigger data-testid="popover-trigger">Open</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner>
							<Popover.Popup data-testid="popover">Popover text</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
			</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
</Tooltip.Root>
<span data-testid="tip-open">{tipOpen}</span>
<button type="button" data-testid="outside">Outside</button>
