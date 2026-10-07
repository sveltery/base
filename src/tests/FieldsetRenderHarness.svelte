<script lang="ts">
	import { Fieldset } from '#lib';

	let { disabled = true }: { disabled?: boolean } = $props();
</script>

<Fieldset.Root {disabled} class="from-root">
	{#snippet render(props, state)}
		<div {...props} data-testid="custom" data-disabled-state={state.disabled ? 'yes' : 'no'}>
			<Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
		</div>
	{/snippet}
</Fieldset.Root>
