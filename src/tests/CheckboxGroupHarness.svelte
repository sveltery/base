<script lang="ts">
	import { untrack } from 'svelte';
	import { Checkbox, CheckboxGroup, type CheckboxGroupChangeEventDetails } from '#lib';

	type Scenario =
		| 'plain'
		| 'empty'
		| 'clear'
		| 'initial'
		| 'disabled'
		| 'disabled-override'
		| 'enabled'
		| 'cancel'
		| 'parent'
		| 'parent-initial'
		| 'parent-cancel-child'
		| 'parent-cancel-parent'
		| 'parent-cancel-group'
		| 'parent-cancel-snapshot'
		| 'parent-disabled-off'
		| 'parent-disabled-on'
		| 'isolated'
		| 'aria'
		| 'custom-id'
		| 'rendered-id'
		| 'input-id'
		| 'constructor'
		| 'unmount'
		| 'shared'
		| 'no-value'
		| 'form'
		| 'style'
		| 'render'
		| 'attach'
		| 'override'
		| 'controlled'
		| 'ignore-checked'
		| 'label'
		| 'prevent'
		| 'name-key';

	let { scenario = 'plain' }: { scenario?: Scenario } = $props();

	const all = ['a', 'b', 'c'];

	let showB = $state(true);
	let showSecond = $state(true);
	let selection = $state<string[] | undefined>(untrack(() => initialSelection(scenario)));
	let calls = $state<{ value: string[]; reason: string; canceled: boolean }[]>([]);
	let checkedCalls = $state<{ checked: boolean; canceled: boolean }[]>([]);
	let submitted = $state<(string | null)[]>([]);
	let attached = $state('none');

	function initialSelection(name: Scenario): string[] | undefined {
		if (name === 'clear') return ['red'];
		if (name === 'controlled') return ['b'];
		if (name === 'empty') return [''];
		if (name === 'initial' || name === 'style') return name === 'style' ? ['a'] : ['red'];
		if (name === 'render') return ['b'];
		if (
			name === 'parent-initial' ||
			name === 'parent-cancel-group' ||
			name === 'parent-disabled-on'
		) {
			return ['a'];
		}
		if (name === 'parent-cancel-snapshot') return ['a', 'b', 'c'];
		return [];
	}

	function record(next: string[], details: CheckboxGroupChangeEventDetails) {
		if (
			scenario === 'cancel' ||
			scenario === 'parent-cancel-group' ||
			scenario === 'parent-cancel-snapshot'
		) {
			details.cancel();
		}
		calls = [...calls, { value: [...next], reason: details.reason, canceled: details.isCanceled }];
	}

	function recordChecked(next: boolean, details: { cancel: () => void; isCanceled: boolean }) {
		if (scenario === 'parent-cancel-child' || scenario === 'parent-cancel-parent') details.cancel();
		checkedCalls = [...checkedCalls, { checked: next, canceled: details.isCanceled }];
	}

	function capture(node: HTMLElement) {
		attached = node.getAttribute('role') ?? 'empty';
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

	const childChecked = $derived(
		scenario === 'parent' || scenario === 'parent-cancel-child' ? recordChecked : undefined
	);
	const parentChecked = $derived(scenario === 'parent-cancel-parent' ? recordChecked : undefined);
	const groupDisabled = $derived(
		scenario === 'disabled' || scenario === 'disabled-override' || scenario === 'style'
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
			<CheckboxGroup allValues={['a', 'b']} bind:value={selection} onValueChange={record}>
				<Checkbox.Root parent>All</Checkbox.Root>
				<Checkbox.Root name="topping" value="a">A</Checkbox.Root>
				<Checkbox.Root name="topping" value="b">B</Checkbox.Root>
			</CheckboxGroup>
			<button type="submit">Submit</button>
		</form>
	{:else if scenario === 'isolated'}
		<CheckboxGroup allValues={['a-1', 'a-2']} bind:value={selection} onValueChange={record}>
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
	{:else if scenario === 'custom-id'}
		<CheckboxGroup allValues={['a']}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root id="custom" value="a" data-testid="a" nativeButton>
				{#snippet render(props)}
					<button {...props}>A</button>
				{/snippet}
			</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'rendered-id'}
		<CheckboxGroup allValues={['a']}>
			<Checkbox.Root parent data-testid="parent">All</Checkbox.Root>
			<Checkbox.Root value="a" nativeButton>
				{#snippet render(props)}
					<button {...props} id="rendered" data-testid="a">A</button>
				{/snippet}
			</Checkbox.Root>
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
				<div
					{...props}
					data-testid="custom"
					data-disabled-state={groupState.disabled ? 'yes' : 'no'}
				>
					<Checkbox.Root value="a">A</Checkbox.Root>
					<Checkbox.Root value="b">B</Checkbox.Root>
				</div>
			{/snippet}
		</CheckboxGroup>
	{:else if scenario === 'attach'}
		<CheckboxGroup aria-label="Colors" {@attach capture}>
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'override'}
		<CheckboxGroup role="region" id="group-id" data-testid="root">
			<Checkbox.Root value="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'label'}
		<CheckboxGroup bind:value={selection} onValueChange={record}>
			<label data-testid="label-a">
				<Checkbox.Root value="a" />
				Apple
			</label>
		</CheckboxGroup>
	{:else if scenario === 'prevent'}
		<CheckboxGroup bind:value={selection} onValueChange={record}>
			<Checkbox.Root value="a" data-testid="a" onclick={(event) => event.preventDefault()}>
				A
			</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'name-key'}
		<CheckboxGroup bind:value={selection} onValueChange={record}>
			<Checkbox.Root name="red" data-testid="red">Red</Checkbox.Root>
			<Checkbox.Root name="green" data-testid="green">Green</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'empty'}
		<CheckboxGroup bind:value={selection} onValueChange={record}>
			<Checkbox.Root value="" data-testid="empty">Empty</Checkbox.Root>
			<Checkbox.Root value="other" data-testid="other">Other</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'clear'}
		<CheckboxGroup value={selection}>
			<Checkbox.Root value="red" data-testid="red">Red</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'initial'}
		<CheckboxGroup bind:value={selection} onValueChange={record}>
			<Checkbox.Root name="red" data-testid="red">Red</Checkbox.Root>
			<Checkbox.Root name="green" data-testid="green">Green</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'disabled' || scenario === 'disabled-override' || scenario === 'enabled'}
		<CheckboxGroup
			aria-label="Colors"
			disabled={groupDisabled}
			bind:value={selection}
			onValueChange={record}
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
	{:else if scenario === 'cancel'}
		<CheckboxGroup bind:value={selection} onValueChange={record}>
			<Checkbox.Root value="red" data-testid="red">Red</Checkbox.Root>
			<Checkbox.Root value="green" data-testid="green">Green</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'ignore-checked'}
		<CheckboxGroup bind:value={selection}>
			<Checkbox.Root value="a" checked data-testid="a">A</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'controlled'}
		<CheckboxGroup aria-label="Colors" value={selection} onValueChange={record}>
			<Checkbox.Root value="a" data-testid="a">A</Checkbox.Root>
			<Checkbox.Root value="b">B</Checkbox.Root>
		</CheckboxGroup>
	{:else if scenario === 'parent' || scenario === 'parent-initial' || scenario === 'parent-cancel-child' || scenario === 'parent-cancel-parent' || scenario === 'parent-cancel-group' || scenario === 'parent-cancel-snapshot' || scenario === 'parent-disabled-off' || scenario === 'parent-disabled-on'}
		<CheckboxGroup allValues={all} bind:value={selection} onValueChange={record}>
			<Checkbox.Root parent data-testid="parent" onCheckedChange={parentChecked}>All</Checkbox.Root>
			<Checkbox.Root
				value="a"
				data-testid="a"
				disabled={scenario === 'parent-disabled-off' || scenario === 'parent-disabled-on'}
				onCheckedChange={childChecked}
			>
				A
			</Checkbox.Root>
			<Checkbox.Root value="b" data-testid="b">B</Checkbox.Root>
			<Checkbox.Root value="c" data-testid="c">C</Checkbox.Root>
		</CheckboxGroup>
	{:else}
		<CheckboxGroup aria-label="Colors" bind:value={selection} onValueChange={record}>
			<Checkbox.Root value="red" data-testid="red">Red</Checkbox.Root>
			<Checkbox.Root value="green" data-testid="green">Green</Checkbox.Root>
			<Checkbox.Root value="blue" data-testid="blue">Blue</Checkbox.Root>
		</CheckboxGroup>
	{/if}
</div>

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="checked-calls">{JSON.stringify(checkedCalls)}</output>
<output data-testid="values">{JSON.stringify(submitted)}</output>
<output data-testid="attached">{attached}</output>
