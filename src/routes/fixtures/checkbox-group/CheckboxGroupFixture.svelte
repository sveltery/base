<script lang="ts">
	import { Checkbox, CheckboxGroup } from '#lib';
	import type { CheckboxGroupCase } from './cases.js';

	let { scenario }: { scenario: CheckboxGroupCase } = $props();

	// svelte-ignore state_referenced_locally
	let value = $state<string[]>(scenario === 'bound' || scenario === 'form' ? [] : ['b']);
	let calls = $state<{ value: string[]; reason: string; canceled: boolean }[]>([]);
	let submitted = $state<string[]>([]);
	// The boxes have no content of their own, so the fixture gives them a size to click.
	const size = 'display: inline-block; width: 16px; height: 16px';

	// Sveltery: the boxes are native inputs. `change` stands in for `onValueChange`, and a
	// click handler that cancels stands in for its `cancel()`.
	function checkedValues(group: HTMLElement) {
		return [...group.querySelectorAll<HTMLInputElement>('input:checked')]
			.filter((input) => input.name || input.value)
			.map((input) => input.value);
	}

	function onchange(event: Event & { currentTarget: HTMLFieldSetElement }) {
		calls = [
			...calls,
			{ value: checkedValues(event.currentTarget), reason: 'none', canceled: false }
		];
	}

	function cancel(event: MouseEvent & { currentTarget: HTMLInputElement }) {
		const group = event.currentTarget.closest('fieldset');
		if (!group) return;
		calls = [...calls, { value: checkedValues(group), reason: 'none', canceled: true }];
		event.preventDefault();
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

{#snippet box(item: string, label = item.toUpperCase())}
	<Checkbox.Root
		value={item}
		aria-label={label}
		style={size}
		onclick={scenario === 'cancel' ? cancel : undefined}
	/>
{/snippet}

<div>
	{#if scenario === 'bound'}
		<input
			type="checkbox"
			aria-label="Owner B"
			checked={value.includes('b')}
			onclick={toggleOwner}
		/>
		<CheckboxGroup aria-label="Colors" bind:value {onchange}>
			{@render box('a')}
			{@render box('b')}
		</CheckboxGroup>
	{:else if scenario === 'form'}
		<form {onsubmit}>
			<CheckboxGroup aria-label="Colors" name="topping" allValues={['a', 'b']} bind:value>
				<Checkbox.Root parent aria-label="All" style={size} />
				{@render box('a')}
				{@render box('b')}
			</CheckboxGroup>
			<button type="submit">Submit</button>
		</form>
	{:else if scenario === 'parent'}
		<CheckboxGroup aria-label="Colors" allValues={['a', 'b']} {onchange}>
			<Checkbox.Root parent aria-label="All" style={size} />
			{@render box('a')}
			{@render box('b')}
		</CheckboxGroup>
	{:else if scenario === 'initial'}
		<CheckboxGroup aria-label="Colors" value={['b']}>
			{@render box('a')}
			{@render box('b')}
		</CheckboxGroup>
	{:else}
		<CheckboxGroup aria-label="Colors" disabled={scenario === 'disabled'} {onchange}>
			{@render box('a')}
			{@render box('b')}
		</CheckboxGroup>
	{/if}
</div>

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="submitted">{JSON.stringify(submitted)}</output>
