<script lang="ts">
	import { Fieldset } from '#lib';
	import FieldsetCases from '../routes/fixtures/fieldset/FieldsetCases.svelte';

	let {
		scenario
	}: {
		scenario:
			'disabled' | 'nested' | 'legend' | 'custom-id' | 'dynamic' | 'labels' | 'nested-labels';
	} = $props();

	let outerDisabled = $state(false);
	let innerDisabled = $state(true);
</script>

{#if scenario === 'disabled'}
	<Fieldset.Root disabled data-testid="fieldset">
		<Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
		<input aria-label="Name" />
	</Fieldset.Root>
{:else if scenario === 'nested'}
	<Fieldset.Root disabled={outerDisabled} data-testid="outer">
		<Fieldset.Root disabled={innerDisabled} data-testid="inner">
			<input aria-label="Name" data-testid="control" />
		</Fieldset.Root>
	</Fieldset.Root>
	<button type="button" onclick={() => (outerDisabled = true)}>Disable outer</button>
	<button type="button" onclick={() => (innerDisabled = false)}>Enable inner</button>
	<button type="button" onclick={() => (outerDisabled = false)}>Enable outer</button>
{:else if scenario === 'legend'}
	<Fieldset.Root data-testid="fieldset">
		<Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
	</Fieldset.Root>
{:else if scenario === 'custom-id'}
	<Fieldset.Root data-testid="fieldset">
		<Fieldset.Legend id="legend-id" data-testid="legend">Legend</Fieldset.Legend>
	</Fieldset.Root>
{:else}
	<FieldsetCases {scenario} />
{/if}
