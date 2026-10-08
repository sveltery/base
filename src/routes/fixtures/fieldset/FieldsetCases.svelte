<script lang="ts">
	import { Fieldset } from '#lib';

	let { scenario }: { scenario: string } = $props();

	let legendId = $state('legend-a');
	let showLegend = $state(true);
	let labels = $state<'old' | 'both' | 'new'>('old');
</script>

{#if scenario === 'dynamic'}
	<Fieldset.Root data-testid="fieldset">
		{#if showLegend}
			<Fieldset.Legend id={legendId} data-testid="legend">Legend</Fieldset.Legend>
		{/if}
	</Fieldset.Root>
	<button type="button" onclick={() => (legendId = 'legend-b')}>Change id</button>
	<button type="button" onclick={() => (showLegend = false)}>Remove legend</button>
{:else if scenario === 'labels'}
	<Fieldset.Root data-testid="fieldset">
		{#if labels !== 'new'}
			<Fieldset.Legend id="old-label" data-testid="old">Old</Fieldset.Legend>
		{/if}
		{#if labels !== 'old'}
			<Fieldset.Legend id="new-label" data-testid="new">New</Fieldset.Legend>
		{/if}
	</Fieldset.Root>
	<button type="button" onclick={() => (labels = 'both')}>Show both</button>
	<button type="button" onclick={() => (labels = 'new')}>Show new</button>
{:else}
	<Fieldset.Root data-testid="outer">
		<Fieldset.Legend id="outer-legend">Outer</Fieldset.Legend>
		<Fieldset.Root data-testid="inner">
			<Fieldset.Legend id="inner-legend">Inner</Fieldset.Legend>
		</Fieldset.Root>
	</Fieldset.Root>
{/if}
