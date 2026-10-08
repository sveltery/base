<script lang="ts">
	import { DirectionProvider, Tabs } from '#lib';
	import { TabsFixtureModel } from '../choice-fixtures.svelte.js';
	import type { TabsCase } from './cases.js';

	let { scenario }: { scenario: TabsCase } = $props();
	const model = new TabsFixtureModel(() => scenario);
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'bound'}
			<input
				type="checkbox"
				aria-label="Owner two"
				checked={model.value === 1}
				onclick={model.toggleOwner}
			/>
			<Tabs.Root bind:value={model.value} onValueChange={model.onValueChange}>
				{@render tabs(false)}
			</Tabs.Root>
		{:else}
			<Tabs.Root orientation={model.orientation} onValueChange={model.onValueChange}>
				{@render tabs(scenario === 'fallback')}
			</Tabs.Root>
		{/if}
	</div>
	<output data-testid="calls">{JSON.stringify(model.calls)}</output>
</DirectionProvider>

{#snippet tabs(disableFirst: boolean)}
	<Tabs.List
		aria-label="Sections"
		activateOnFocus={scenario === 'follow'}
		loopFocus={scenario !== 'loop'}
	>
		{#each { length: model.count } as _, index (index)}
			<Tabs.Tab
				value={index}
				disabled={(disableFirst && index === 0) || (scenario === 'disabled' && index === 1)}
			>
				{model.labels[index]}
			</Tabs.Tab>
		{/each}
		<Tabs.Indicator data-testid="indicator" />
	</Tabs.List>
	{#each { length: model.count } as _, index (index)}
		<Tabs.Panel value={index}>{model.labels[index]} panel</Tabs.Panel>
	{/each}
{/snippet}
