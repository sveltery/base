<script lang="ts">
	import { untrack } from 'svelte';
	import { Progress } from '#lib';
	import { scenarioModel, type ProgressCase } from './cases.js';

	let { scenario }: { scenario: ProgressCase } = $props();

	// The fixture page does not change `case` after load.
	const model = scenarioModel(untrack(() => scenario));
	let value = $state<number | null>(model.value);
	let min = $state(model.min);
	let max = $state(model.max);
	let labelId = $state('label-a');
	let showLabel = $state(true);
	let currency = $state<'USD' | 'EUR'>('USD');

	const format = $derived(
		scenario === 'formatted'
			? { style: 'currency' as const, currency }
			: scenario === 'locale'
				? { style: 'decimal' as const, minimumFractionDigits: 2, maximumFractionDigits: 2 }
				: undefined
	);

	function ariaText(formatted: string, raw: number | null) {
		return raw == null ? 'Waiting to start' : `${formatted} uploaded`;
	}
</script>

{#if scenario === 'cycle'}
	<button type="button" onclick={() => (value = null)}>Indeterminate</button>
	<button type="button" onclick={() => (value = 50)}>Halfway</button>
	<button type="button" onclick={() => (value = 100)}>Complete</button>
{:else if scenario === 'range'}
	<button type="button" onclick={() => (value = 50)}>Over</button>
	<button type="button" onclick={() => (value = 10)}>Under</button>
{:else if scenario === 'formatted'}
	<button type="button" onclick={() => (currency = currency === 'USD' ? 'EUR' : 'USD')}>
		Switch currency
	</button>
{:else if scenario === 'aria-text' || scenario === 'value-child'}
	<button type="button" onclick={() => (value = null)}>Clear</button>
{:else if scenario === 'label'}
	<button type="button" onclick={() => (labelId = 'label-b')}>Change id</button>
	<button type="button" onclick={() => (showLabel = false)}>Remove label</button>
{/if}

<Progress.Root
	id="tested-progress"
	{value}
	{min}
	{max}
	{format}
	locale={model.locale}
	getAriaValueText={scenario === 'aria-text' ? ariaText : undefined}
>
	{#if showLabel}
		{#if scenario === 'label'}
			<Progress.Label data-testid="label" id={labelId}>Upload progress</Progress.Label>
		{:else}
			<Progress.Label data-testid="label">Upload progress</Progress.Label>
		{/if}
	{/if}
	{#if scenario === 'value-child'}
		<Progress.Value data-testid="value">
			{#snippet children(formatted, raw)}
				{formatted}|{raw === null ? 'null' : String(raw)}
			{/snippet}
		</Progress.Value>
	{:else}
		<Progress.Value data-testid="value" />
	{/if}
	<Progress.Track data-testid="track">
		<Progress.Indicator data-testid="indicator" />
	</Progress.Track>
</Progress.Root>
