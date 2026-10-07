<script lang="ts">
	import { Meter } from '#lib';
</script>

<Meter.Root value={40} style="width:100px">
	<Meter.Indicator>
		{#snippet render(props, _state, children)}
			<div {...props} data-testid="custom-indicator">{@render children()}</div>
		{/snippet}
	</Meter.Indicator>
</Meter.Root>
