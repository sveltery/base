<script lang="ts">
	import { Popover } from '#lib';

	let showViewport = $state(false);
</script>

<div style="position: fixed; top: 0; left: 0">
	<Popover.Root open>
		<Popover.Trigger
			style="width: 72px; height: 36px; box-sizing: border-box; padding: 0; border: 0"
		>
			Trigger
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner data-testid="positioner">
				<Popover.Popup style="width: 52px; height: 24px">
					{#if showViewport}<Popover.Viewport>Popup</Popover.Viewport>{:else}Popup{/if}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
</div>
<button type="button" onclick={() => (showViewport = !showViewport)}>Toggle Viewport</button>
