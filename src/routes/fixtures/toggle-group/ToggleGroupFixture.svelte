<script lang="ts">
	import { DirectionProvider, Toggle, ToggleGroup } from '#lib';
	import { ToggleGroupFixtureModel } from '../choice-fixtures.svelte.js';
	import type { ToggleGroupCase } from './cases.js';

	let { scenario }: { scenario: ToggleGroupCase } = $props();
	const model = new ToggleGroupFixtureModel(() => scenario);
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'bound'}
			<input
				type="checkbox"
				aria-label="Owner two"
				checked={model.value.includes('two')}
				onclick={model.toggleOwner}
			/>
			<ToggleGroup
				aria-label="Formatting"
				bind:value={model.value}
				onValueChange={model.onValueChange}
			>
				<Toggle value="one">One</Toggle>
				<Toggle value="two">Two</Toggle>
			</ToggleGroup>
		{:else}
			<ToggleGroup
				aria-label="Formatting"
				orientation={model.orientation}
				multiple={scenario === 'multiple'}
				disabled={scenario === 'disabled'}
				onValueChange={scenario === 'exclusive' || scenario === 'cancel' || scenario === 'disabled'
					? model.onValueChange
					: undefined}
			>
				{#each ['one', 'two', 'three'].slice(0, model.count) as itemValue, index (itemValue)}
					<Toggle value={itemValue}>{['One', 'Two', 'Three'][index]}</Toggle>
				{/each}
			</ToggleGroup>
		{/if}
	</div>
</DirectionProvider>
<output data-testid="calls">{JSON.stringify(model.calls)}</output>
