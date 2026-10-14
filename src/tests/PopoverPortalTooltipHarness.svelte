<script lang="ts">
	import { Popover, Tooltip } from '#lib';

	let { inPopup }: { inPopup: boolean } = $props();
</script>

{#snippet tooltip()}
	<Tooltip.Root open>
		<Tooltip.Trigger data-testid="tip-trigger">Tip</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup data-testid="tip">Tip text</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{/snippet}

<Popover.Root>
	<Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup data-testid="popup">
				{#if inPopup}{@render tooltip()}{/if}
			</Popover.Popup>
		</Popover.Positioner>
		{#if !inPopup}{@render tooltip()}{/if}
	</Popover.Portal>
</Popover.Root>
