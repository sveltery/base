<script lang="ts">
	import { Popover } from '#lib';

	let {
		open = $bindable(true),
		offset = 0,
		triggerKey = 0
	}: { open?: boolean; offset?: number; triggerKey?: number } = $props();
	let showViewport = $state(false);
</script>

<div style="position: fixed; top: {offset}px; left: {offset}px">
	<Popover.Root bind:open>
		{#key triggerKey}
			<Popover.Trigger
				style="width: 72px; height: 36px; box-sizing: border-box; padding: 0; border: 0"
			>
				Trigger
			</Popover.Trigger>
		{/key}
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
