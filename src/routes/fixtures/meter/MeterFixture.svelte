<script lang="ts">
	import { Meter } from '#lib';
	import { ariaValueText, currencyFormat, type MeterCase } from './cases.js';

	let { scenario }: { scenario: MeterCase } = $props();

	let live = $state(40);
	let labelId = $state('label-a');
	let showLabel = $state(true);

	const value = $derived(
		scenario === 'live'
			? live
			: scenario === 'clamp'
				? 150
				: scenario === 'range'
					? 30
					: scenario === 'label'
						? 50
						: scenario === 'basic'
							? 40
							: 30
	);
	const min = $derived(scenario === 'range' ? 20 : 0);
	const max = $derived(scenario === 'range' ? 40 : 100);
	const locale = $derived(scenario === 'locale' ? 'de-DE' : 'en-US');
	const format = $derived(scenario === 'currency' ? currencyFormat : undefined);
	const label = $derived(
		scenario === 'label'
			? 'Battery level'
			: scenario === 'locale'
				? 'Speicher'
				: scenario === 'range'
					? 'Level'
					: scenario === 'currency'
						? 'Cost'
						: 'Storage'
	);
</script>

{#if scenario === 'live'}
	<button type="button" onclick={() => (live = 77)}>Set 77</button>
{/if}
{#if scenario === 'label'}
	<button type="button" onclick={() => (labelId = 'label-b')}>Change id</button>
	<button type="button" onclick={() => (showLabel = false)}>Remove label</button>
{/if}

<Meter.Root
	id="tested-meter"
	{value}
	{min}
	{max}
	{locale}
	{format}
	getAriaValueText={scenario === 'aria' ? ariaValueText : undefined}
>
	{#if scenario !== 'label' || showLabel}
		<Meter.Label id={scenario === 'label' ? labelId : undefined}>{label}</Meter.Label>
	{/if}
	<Meter.Value id="meter-value" />
	<Meter.Track>
		<Meter.Indicator id="meter-indicator" />
	</Meter.Track>
</Meter.Root>
