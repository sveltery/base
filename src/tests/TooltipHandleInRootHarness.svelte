<script lang="ts">
	import { Tooltip } from '#lib';

	const inner = Tooltip.createHandle();
</script>

{#snippet portal(text: string)}
	<Tooltip.Portal>
		<Tooltip.Positioner>
			<Tooltip.Popup>{text}</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
{/snippet}

<Tooltip.Root>
	<Tooltip.Trigger data-testid="outer-trigger" delay={0}>Outer</Tooltip.Trigger>
	<Tooltip.Trigger data-testid="inner-trigger" handle={inner} delay={0}>Inner</Tooltip.Trigger>
	{@render portal('Outer content')}
</Tooltip.Root>
<Tooltip.Root handle={inner}>
	{@render portal('Inner content')}
</Tooltip.Root>
