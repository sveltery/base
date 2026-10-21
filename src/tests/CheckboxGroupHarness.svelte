<script lang="ts">
	import { untrack } from 'svelte';
	import { Checkbox, CheckboxGroup, Fieldset } from '#lib';

	type Scenario =
		| 'plain'
		| 'empty'
		| 'clear'
		| 'initial'
		| 'disabled'
		| 'disabled-override'
		| 'enabled'
		| 'parent'
		| 'parent-initial'
		| 'parent-prevent'
		| 'parent-disabled-off'
		| 'parent-disabled-on'
		| 'isolated'
		| 'aria'
		| 'input-id'
		| 'constructor'
		| 'unmount'
		| 'shared'
		| 'no-value'
		| 'form'
		| 'group-name'
		| 'style'
		| 'render'
		| 'attach'
		| 'override'
		| 'controlled'
		| 'adopt-checked'
		| 'label'
		| 'legend'
		| 'prevent'
		| 'name-key';

	let { scenario = 'plain' }: { scenario?: Scenario } = $props();

	const all = ['a', 'b', 'c'];

	let showB = $state(true);
	let showSecond = $state(true);
	let selection = $state<string[] | undefined>(untrack(() => initialSelection(scenario)));
	/** The `value` of each input whose `change` event reached the group, in order. */
	let changes = $state<string[]>([]);
	let submitted = $state<(string | null)[] | null>(null);
	let attached = $state('none');

	function initialSelection(name: Scenario): string[] | undefined {
		if (name === 'clear') return ['red'];
		if (name === 'controlled') return ['b'];
		if (name === 'empty') return [''];
		if (name === 'initial') return ['red'];
		if (name === 'render') return ['b'];
		if (name === 'parent-initial' || name === 'parent-disabled-on') return ['a'];
		return [];
	}

	function record(event: Event) {
		if (event.target instanceof HTMLInputElement) changes = [...changes, event.target.value];
	}

	function capture(node: HTMLElement) {
		attached = node.tagName.toLowerCase();
		return () => {
			attached = 'none';
		};
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		submitted = new FormData(form)
			.getAll('topping')
			.map((entry) => (typeof entry === 'string' ? entry : null));
	}

	const groupDisabled = $derived(
		scenario === 'disabled' || scenario === 'disabled-override' || scenario === 'style'
	);
	const parentScenario = $derived(
		scenario === 'parent' ||
			scenario === 'parent-initial' ||
			scenario === 'parent-prevent' ||
			scenario === 'parent-disabled-off' ||
			scenario === 'parent-disabled-on'
	);
</script>

<div>
	{#if scenario === 'clear' || scenario === 'controlled'}
		<button type="button" onclick={() => (selection = ['a'])}>Set A</button>
		<button type="button" onclick={() => (selection = undefined)}>Clear</button>
	{/if}
	{#if scenario === 'unmount'}
		<button type="button" onclick={() => (showB = false)}>Hide B</button>
	{/if}
	{#if scenario === 'shared'}
		<button type="button" onclick={() => (showSecond = false)}>Hide second</button>
	{/if}

	{#if scenario === 'form'}
		<form {onsubmit}>
			<CheckboxGroup allValues={['a', 'b']} bind:value={selection} onchange={record}>
				<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
				<Checkbox.Root name="topping" value="a" data-testid="a">A</Checkbox.Root>
				<Checkbox.Root name="topping" value="b" data-testid="b">B</Checkbox.Root>
			</CheckboxGroup>
			<button type="submit">Submit</button>
		</form>
	{:else if scenario === 'group-name'}
		<form {onsubmit}>
			<CheckboxGroup name="topping" defaultValue={['a', 'c']}>
				<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
				<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
				<Checkbox.Root value="c" data-testid="c">C</Checkbox.Root>
			</CheckboxGroup>
			<button type="submit">Submit</button>
		</form>
	{:else if scenario === 'isolated'}
		<CheckboxGroup allValues={['a-1', 'a-2']} bind:value={selection}>
			<Checkbox.Root parent data-testid="a-parent">A parent</Checkbox.Root>
			<Checkbox.Root value="a-1" data-testid="a-1">A1</Checkbox.Root>
			<Checkbox.Root value="a-2" data-testid="a-2">A2</Checkbox.Root>
		</CheckboxGroup>
		<CheckboxGroup allValues={['b-1', 'b-2']}>
			<Checkbox.Root parent data-testid="b-parent">B parent</Checkbox.Root>
			<Checkbox.Root value="b-1" data-testid="b-1">B1</Checkbox.Root>
			<Checkbox.Root value="b-2" data-testid="b-2">B2</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'aria' || scenario === 'unmount'}
		<CheckboxGroup allValues={all}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
			{#if showB}
				<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
			{/if}
			<Checkbox.Root value="c" data-testid="c">C</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'input-id'}
		<CheckboxGroup allValues={['a']}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root id="custom" value="a" data-testid="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'constructor'}
		<CheckboxGroup allValues={['a', 'constructor']}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'shared'}
		<CheckboxGroup allValues={all}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
			<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
			{#if showSecond}
				<Checkbox.Root value="b" data-testid="second-b">B2</Checkbox.Root>
			{/if}
		</CheckboxGroup>
	{:else if scenario === 'no-value'}
		<CheckboxGroup allValues={['a']} bind:value={selection}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root id="standalone" data-testid="no-value">Loose</Checkbox.Root>
			<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'style'}
		<CheckboxGroup value={['a']} disabled>
			<Checkbox.Root value="a" data-testid="on">
				<Checkbox.Indicator data-testid="indicator" />
				A
			</Checkbox.Root>
			<Checkbox.Root value="b" data-testid="off">B</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'render'}
		<CheckboxGroup value={['b']}>
			{#snippet render(props, groupState)}
				<fieldset
					{...props}
					data-testid="custom"
					data-disabled-state={groupState.disabled ? 'yes' : 'no'}
				>
					<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
					<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
				</fieldset>
			{/snippet}
		</CheckboxGroup>
	{:else if scenario === 'attach'}
		<CheckboxGroup aria-label="Colors" {@attach capture}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'override'}
		<CheckboxGroup id="group-id" data-testid="root">
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'legend'}
		<CheckboxGroup data-testid="root">
			<Fieldset.Legend>Toppings</Fieldset.Legend>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'label'}
		<CheckboxGroup bind:value={selection} onchange={record}>
			<label data-testid="label-a">
				<Checkbox.Root
					value="a"
					data-testid="a"
					style="display: inline-block; width: 16px; height: 16px"
				/>
				Apple
			</label>
		</CheckboxGroup>
	{:else if scenario === 'prevent'}
		<CheckboxGroup bind:value={selection} onchange={record}>
			<Checkbox.Root value="a" data-testid="a" onclick={(event) => event.preventDefault()}>
				A
			</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'name-key' || scenario === 'initial'}
		<CheckboxGroup bind:value={selection} onchange={record}>
			<Checkbox.Root name="red" data-testid="red">Red</Checkbox.Root>
			<Checkbox.Root name="green" data-testid="green">Green</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'empty'}
		<CheckboxGroup bind:value={selection} onchange={record}>
			<Checkbox.Root value="" data-testid="empty">Empty</Checkbox.Root>
			<Checkbox.Root value="other" data-testid="other">Other</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'clear'}
		<CheckboxGroup value={selection}>
			<Checkbox.Root value="red" data-testid="red">Red</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'disabled' || scenario === 'disabled-override' || scenario === 'enabled'}
		<CheckboxGroup
			aria-label="Colors"
			disabled={groupDisabled}
			bind:value={selection}
			onchange={record}
		>
			<Checkbox.Root
				name="red"
				data-testid="red"
				disabled={scenario === 'disabled-override' ? false : undefined}
			>
				Red
			</Checkbox.Root>
			<Checkbox.Root name="green" data-testid="green">Green</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'adopt-checked'}
		<CheckboxGroup bind:value={selection}>
			<Checkbox.Root value="a" checked data-testid="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'controlled'}
		<CheckboxGroup aria-label="Colors" value={selection}>
			<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
			<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
		</CheckboxGroup>
	{:else if parentScenario}
		<CheckboxGroup allValues={all} bind:value={selection} onchange={record}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root
				value="a"
				data-testid="a"
				disabled={scenario === 'parent-disabled-off' || scenario === 'parent-disabled-on'}
				onclick={scenario === 'parent-prevent' ? (event) => event.preventDefault() : undefined}
			>
				A
			</Checkbox.Root>
			<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
			<Checkbox.Root value="c" data-testid="c">C</Checkbox.Root>
		</CheckboxGroup>
	{:else}
		<CheckboxGroup aria-label="Colors" bind:value={selection} onchange={record}>
			<Checkbox.Root value="red" data-testid="red">Red</Checkbox.Root>
			<Checkbox.Root value="green" data-testid="green">Green</Checkbox.Root>
			<Checkbox.Root value="blue" data-testid="blue">Blue</Checkbox.Root>
		</CheckboxGroup>
	{/if}
</div>

<output data-testid="value">{JSON.stringify(selection ?? null)}</output>
<output data-testid="changes">{JSON.stringify(changes)}</output>
<output data-testid="values">{JSON.stringify(submitted)}</output>
<output data-testid="attached">{attached}</output>
