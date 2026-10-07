<script lang="ts">
	import { Checkbox, CheckboxGroup } from '#lib';
	import type { CheckboxGroupCase } from './cases.js';

	let { scenario }: { scenario: CheckboxGroupCase } = $props();

	let value = $state<string[]>(scenario === 'bound' || scenario === 'form' ? [] : ['b']);
	let calls = $state<{ value: string[]; reason: string; canceled: boolean }[]>([]);
	let submitted = $state<string[]>([]);

	function onValueChange(
		next: string[],
		details: { reason: string; cancel: () => void; isCanceled: boolean }
	) {
		if (scenario === 'cancel') details.cancel();
		calls = [...calls, { value: [...next], reason: details.reason, canceled: details.isCanceled }];
	}

	function toggleOwner() {
		value = value.includes('b') ? value.filter((item) => item !== 'b') : [...value, 'b'];
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		submitted = new FormData(form)
			.getAll('topping')
			.filter((entry): entry is string => typeof entry === 'string');
	}
</script>

<div>
	{#if scenario === 'bound'}
		<input
			type="checkbox"
			aria-label="Owner B"
			checked={value.includes('b')}
			onclick={toggleOwner}
		/>
		<CheckboxGroup aria-label="Colors" bind:value {onValueChange}>
			<Checkbox.Root value="a">A</Checkbox.Root>
			<Checkbox.Root value="b">B</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'form'}
		<form {onsubmit}>
			<CheckboxGroup aria-label="Colors" allValues={['a', 'b']} bind:value>
				<Checkbox.Root parent>All</Checkbox.Root>
				<Checkbox.Root name="topping" value="a">A</Checkbox.Root>
				<Checkbox.Root name="topping" value="b">B</Checkbox.Root>
			</CheckboxGroup>
			<button type="submit">Submit</button>
		</form>
	{:else if scenario === 'parent'}
		<CheckboxGroup aria-label="Colors" allValues={['a', 'b']} {onValueChange}>
			<Checkbox.Root parent>All</Checkbox.Root>
			<Checkbox.Root value="a">A</Checkbox.Root>
			<Checkbox.Root value="b">B</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'initial'}
		<CheckboxGroup aria-label="Colors" value={['b']}>
			<Checkbox.Root value="a">A</Checkbox.Root>
			<Checkbox.Root value="b">B</Checkbox.Root>
		</CheckboxGroup>
	{:else}
		<CheckboxGroup aria-label="Colors" disabled={scenario === 'disabled'} {onValueChange}>
			<Checkbox.Root value="a">A</Checkbox.Root>
			<Checkbox.Root value="b">B</Checkbox.Root>
		</CheckboxGroup>
	{/if}
</div>

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="submitted">{JSON.stringify(submitted)}</output>
