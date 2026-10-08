<script lang="ts">
	import { DirectionProvider, Fieldset, Radio, RadioGroup } from '#lib';
	import { RadioGroupFixtureModel } from '../choice-fixtures.svelte.js';
	import InitialColorGroup from './InitialColorGroup.svelte';
	import type { RadioGroupCase } from './cases.js';

	let { scenario }: { scenario: RadioGroupCase } = $props();
	const model = new RadioGroupFixtureModel(() => scenario);
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
			<RadioGroup aria-label="Colors" bind:value={model.value} onValueChange={model.onValueChange}>
				<Radio.Root value="a">A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'required'}
			<form onsubmit={model.onsubmit}>
				<RadioGroup aria-label="Colors" name="color" required onValueChange={model.onValueChange}>
					<Radio.Root value="a">A</Radio.Root>
					<Radio.Root value="b">B</Radio.Root>
				</RadioGroup>
				<button type="submit">Submit</button>
			</form>
		{:else if scenario === 'legend'}
			<Fieldset.Root>
				<Fieldset.Legend>Legend</Fieldset.Legend>
				<RadioGroup>
					<Radio.Root value="a">A</Radio.Root>
					<Radio.Root value="b">B</Radio.Root>
				</RadioGroup>
			</Fieldset.Root>
		{:else if scenario === 'initial'}
			<InitialColorGroup />
		{:else}
			<RadioGroup
				aria-label="Colors"
				disabled={scenario === 'disabled'}
				readOnly={scenario === 'readonly'}
				onValueChange={model.onValueChange}
			>
				{#each model.itemValues.slice(0, model.count) as itemValue, index (itemValue)}
					<Radio.Root value={itemValue}>{model.labels[index]}</Radio.Root>
				{/each}
			</RadioGroup>
		{/if}
	</div>
</DirectionProvider>

<output data-testid="calls">{JSON.stringify(model.calls)}</output>
<output data-testid="submitted">{model.submitted}</output>
<output data-testid="value">{model.value ?? 'none'}</output>
