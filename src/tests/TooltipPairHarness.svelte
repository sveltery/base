<script lang="ts">
	import { Tooltip } from '#lib';

	let { timeout }: { timeout?: number } = $props();
</script>

<Tooltip.Provider {timeout}>
	{#each ['First', 'Second'] as name, index (name)}
		<Tooltip.Root>
			<Tooltip.Trigger data-testid="trigger-{index + 1}" delay={0}>{name}</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner>
					<Tooltip.Popup class="tooltip" data-testid="popup-{index + 1}">
						{name} tooltip
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	{/each}
</Tooltip.Provider>
