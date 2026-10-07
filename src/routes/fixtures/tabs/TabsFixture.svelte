<script lang="ts">
	import { DirectionProvider, Tabs } from '#lib';
	import type { TabsCase } from './cases.js';

	let { scenario }: { scenario: TabsCase } = $props();

	let value = $state<number | null>(scenario === 'bound' ? 0 : null);
	let calls = $state<{ value: unknown; reason: string; canceled: boolean }[]>([]);

	const count =
		scenario === 'keyboard' || scenario === 'vertical' || scenario === 'rtl' || scenario === 'loop'
			? 3
			: 2;
	const labels = ['One', 'Two', 'Three'];
	const orientation = scenario === 'vertical' ? 'vertical' : 'horizontal';

	function onValueChange(
		next: unknown,
		details: { reason: string; cancel: () => void; isCanceled: boolean }
	) {
		if (scenario === 'cancel' && details.reason === 'none') details.cancel();
		calls = [...calls, { value: next, reason: details.reason, canceled: details.isCanceled }];
		if (scenario === 'bound' && !details.isCanceled) value = next as number;
	}

	function toggleOwner() {
		value = value === 1 ? 0 : 1;
	}
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'bound'}
			<input type="checkbox" aria-label="Owner two" checked={value === 1} onclick={toggleOwner} />
			<Tabs.Root bind:value {onValueChange}>
				{@render tabs(false)}
			</Tabs.Root>
		{:else}
			<Tabs.Root {orientation} {onValueChange}>
				{@render tabs(scenario === 'fallback')}
			</Tabs.Root>
		{/if}
	</div>
	<output data-testid="calls">{JSON.stringify(calls)}</output>
</DirectionProvider>

{#snippet tabs(disableFirst: boolean)}
	<Tabs.List
		aria-label="Sections"
		activateOnFocus={scenario === 'follow'}
		loopFocus={scenario !== 'loop'}
	>
		{#each { length: count } as _, index (index)}
			<Tabs.Tab
				value={index}
				disabled={(disableFirst && index === 0) || (scenario === 'disabled' && index === 1)}
			>
				{labels[index]}
			</Tabs.Tab>
		{/each}
		<Tabs.Indicator data-testid="indicator" />
	</Tabs.List>
	{#each { length: count } as _, index (index)}
		<Tabs.Panel value={index}>{labels[index]} panel</Tabs.Panel>
	{/each}
{/snippet}
