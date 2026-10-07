<script lang="ts">
	import { DirectionProvider, Fieldset, Radio, RadioGroup } from '#lib';
	import type { RadioGroupCase } from './cases.js';

	let { scenario }: { scenario: RadioGroupCase } = $props();

	let value = $state<string | undefined>(undefined);
	let calls = $state<{ value: string; reason: string; canceled: boolean }[]>([]);
	let submitted = $state(0);

	const count = $derived(scenario === 'keyboard' || scenario === 'rtl' ? 3 : 2);
	const labels = ['A', 'B', 'C'] as const;
	const itemValues = ['a', 'b', 'c'] as const;

	function onValueChange(
		next: unknown,
		details: { reason: string; cancel: () => void; isCanceled: boolean }
	) {
		if (scenario === 'cancel') details.cancel();
		const text = typeof next === 'string' ? next : '';
		calls = [...calls, { value: text, reason: details.reason, canceled: details.isCanceled }];
	}

	function toggleOwner() {
		value = value === 'b' ? undefined : 'b';
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
	}
</script>

<DirectionProvider direction={scenario === 'rtl' ? 'rtl' : 'ltr'}>
	<div dir={scenario === 'rtl' ? 'rtl' : 'ltr'}>
		{#if scenario === 'bound'}
			<input type="checkbox" aria-label="Owner B" checked={value === 'b'} onclick={toggleOwner} />
			<RadioGroup aria-label="Colors" bind:value {onValueChange}>
				<Radio.Root value="a">A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'required'}
			<form {onsubmit}>
				<RadioGroup aria-label="Colors" name="color" required {onValueChange}>
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
			<RadioGroup aria-label="Colors" value="b">
				<Radio.Root value="a" data-testid="a">A</Radio.Root>
				<Radio.Root value="b" data-testid="b">B</Radio.Root>
			</RadioGroup>
		{:else}
			<RadioGroup
				aria-label="Colors"
				disabled={scenario === 'disabled'}
				readOnly={scenario === 'readonly'}
				{onValueChange}
			>
				{#each itemValues.slice(0, count) as itemValue, index (itemValue)}
					<Radio.Root value={itemValue}>{labels[index]}</Radio.Root>
				{/each}
			</RadioGroup>
		{/if}
	</div>
</DirectionProvider>

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="submitted">{submitted}</output>
<output data-testid="value">{value ?? 'none'}</output>
