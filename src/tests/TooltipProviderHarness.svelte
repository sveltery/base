<script lang="ts">
	import { Tooltip, type TooltipProviderProps } from '#lib';

	let {
		provider = {},
		names = [''],
		triggerDelay
	}: { provider?: TooltipProviderProps; names?: string[]; triggerDelay?: number } = $props();
</script>

<Tooltip.Provider {...provider}>
	{#each names as name (name)}
		<Tooltip.Root>
			<Tooltip.Trigger delay={triggerDelay}>{name || 'Trigger'}</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner>
					<Tooltip.Popup>{name ? `Content ${name}` : 'Content'}</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	{/each}
</Tooltip.Provider>
