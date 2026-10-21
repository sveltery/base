<script lang="ts">
	import { DirectionProvider, Fieldset, Radio, RadioGroup } from '#lib';
	import { RadioGroupFixtureModel } from '../choice-fixtures.svelte.js';
	import InitialColorGroup from './InitialColorGroup.svelte';
	import type { RadioGroupCase } from './cases.js';

	let { scenario }: { scenario: RadioGroupCase } = $props();
	const model = new RadioGroupFixtureModel(() => scenario);
	// The boxes have no content of their own, so the fixture gives them a size to click.
	const size = 'display: inline-block; width: 16px; height: 16px';
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'bound'}
			<input
				type="checkbox"
				aria-label="Owner B"
				checked={model.value === 'b'}
				onclick={model.toggleOwner}
			/>
			<RadioGroup aria-label="Colors" bind:value={model.value} onchange={model.changed}>
				<Radio.Root value="a" aria-label="A" style={size} />
				<Radio.Root value="b" aria-label="B" style={size} />
			</RadioGroup>
		{:else if scenario === 'required'}
			<form onsubmit={model.onsubmit}>
				<RadioGroup aria-label="Colors" name="color" required onchange={model.changed}>
					<Radio.Root value="a" aria-label="A" style={size} />
					<Radio.Root value="b" aria-label="B" style={size} />
				</RadioGroup>
				<button type="submit">Submit</button>
			</form>
		{:else if scenario === 'legend'}
			<!-- Sveltery: the group is the fieldset, so the legend goes inside it. -->
			<RadioGroup>
				<Fieldset.Legend>Legend</Fieldset.Legend>
				<Radio.Root value="a" aria-label="A" style={size} />
				<Radio.Root value="b" aria-label="B" style={size} />
			</RadioGroup>
		{:else if scenario === 'initial'}
			<InitialColorGroup />
		{:else}
			<RadioGroup
				aria-label="Colors"
				disabled={scenario === 'disabled'}
				readonly={scenario === 'readonly'}
				onchange={model.changed}
			>
				{#each model.itemValues.slice(0, model.count) as itemValue, index (itemValue)}
					<Radio.Root
						value={itemValue}
						aria-label={model.labels[index]}
						style={size}
						onclick={model.clicked}
					/>
				{/each}
			</RadioGroup>
		{/if}
	</div>
</DirectionProvider>

<output data-testid="calls">{JSON.stringify(model.calls)}</output>
<output data-testid="submitted">{model.submitted}</output>
<output data-testid="value">{model.value ?? 'none'}</output>
