<script lang="ts">
	import { Tooltip } from '#lib';

	const handle = Tooltip.createHandle();
</script>

<Tooltip.Provider timeout={400}>
	<div style="display: flex; gap: 32px">
		{#each [1, 2, 3] as index (index)}
			<Tooltip.Trigger {handle} delay={0}>Trigger {index}</Tooltip.Trigger>
		{/each}
	</div>
	<Tooltip.Root {handle}>
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup data-testid="popup">Tooltip Content</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
