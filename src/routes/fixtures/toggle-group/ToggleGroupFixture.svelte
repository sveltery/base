<script lang="ts">
	import { DirectionProvider, Toggle, ToggleGroup } from '#lib';
	import type { ToggleGroupCase } from './cases.js';

	let { scenario }: { scenario: ToggleGroupCase } = $props();

	let value = $state<string[]>([]);
	let calls = $state<{ value: string[]; reason: string; canceled: boolean }[]>([]);

	const orientation = $derived(scenario === 'vertical' ? 'vertical' : 'horizontal');
	const count = $derived(
		scenario === 'keyboard' || scenario === 'rtl' || scenario === 'vertical' ? 3 : 2
	);

	function onValueChange(
		next: string[],
		details: { reason: string; cancel: () => void; isCanceled: boolean }
	) {
		if (scenario === 'cancel') details.cancel();
		calls = [...calls, { value: next, reason: details.reason, canceled: details.isCanceled }];
		if (scenario === 'bound' && !details.isCanceled) value = next;
	}

	function toggleOwner() {
		value = value.includes('two') ? [] : ['two'];
	}
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'bound'}
			<input
				type="checkbox"
				aria-label="Owner two"
				checked={value.includes('two')}
				onclick={toggleOwner}
			/>
			<ToggleGroup aria-label="Formatting" bind:value {onValueChange}>
				<Toggle value="one">One</Toggle>
				<Toggle value="two">Two</Toggle>
			</ToggleGroup>
		{:else}
			<ToggleGroup
				aria-label="Formatting"
				{orientation}
				multiple={scenario === 'multiple'}
				disabled={scenario === 'disabled'}
				onValueChange={scenario === 'exclusive' || scenario === 'cancel' || scenario === 'disabled'
					? onValueChange
					: undefined}
			>
				{#each ['one', 'two', 'three'].slice(0, count) as itemValue, index (itemValue)}
					<Toggle value={itemValue}>{['One', 'Two', 'Three'][index]}</Toggle>
				{/each}
			</ToggleGroup>
		{/if}
	</div>
</DirectionProvider>
<output data-testid="calls">{JSON.stringify(calls)}</output>
