<script lang="ts">
	import { untrack } from 'svelte';
	import { Radio } from '#lib';
	import { setRadioGroupContext } from '#lib/radio/group-context.js';
	import type { RadioRootChangeEventDetails } from '#lib/radio/types.js';

	let {
		scenario = 'select'
	}: {
		scenario?:
			| 'select'
			| 'cancel'
			| 'null'
			| 'disabled'
			| 'readonly'
			| 'required'
			| 'bubble'
			| 'stop'
			| 'native-bubble'
			| 'native-stop'
			| 'native'
			| 'label'
			| 'touched'
			| 'form'
			| 'object'
			| 'prevented';
	} = $props();

	const first = { id: 1 };
	const second = { id: 2 };
	const initial = untrack(() => scenario);
	const open =
		initial === 'required' ||
		initial === 'null' ||
		initial === 'object' ||
		initial === 'bubble' ||
		initial === 'stop' ||
		initial === 'native-bubble' ||
		initial === 'native-stop';

	// Raw state keeps the radio's value reference. Proxied $state would break ===.
	let checkedValue = $state.raw<unknown>(
		open ? undefined : initial === 'native' || initial === 'label' ? 'b' : 'a'
	);
	let touched = $state(initial === 'touched');
	let calls = $state<{ value: string; reason: string; canceled: boolean }[]>([]);
	let values = $state<(string | null)[]>([]);
	let submitted = $state(0);
	let parentClicks = $state(0);

	const groupName = initial === 'form' || initial === 'required' ? 'color' : undefined;

	setRadioGroupContext({
		get disabled() {
			return scenario === 'disabled' || undefined;
		},
		get readOnly() {
			return scenario === 'readonly' || undefined;
		},
		get required() {
			return scenario === 'required' || undefined;
		},
		get form() {
			return undefined;
		},
		get name() {
			return groupName;
		},
		get checkedValue() {
			return checkedValue;
		},
		get touched() {
			return touched;
		},
		setCheckedValue(next: unknown, details: RadioRootChangeEventDetails) {
			if (scenario === 'cancel') details.cancel();
			calls.push({
				value: JSON.stringify(next),
				reason: details.reason,
				canceled: details.isCanceled
			});
			if (!details.isCanceled) checkedValue = next;
		},
		setTouched(next: boolean) {
			touched = next;
		},
		registerInput() {}
	});

	function clicked(event: MouseEvent) {
		if (scenario === 'stop' || scenario === 'native-stop') event.stopPropagation();
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const entry = new FormData(form).get('color');
		values = [...values, typeof entry === 'string' ? entry : null];
	}
</script>

{#if scenario === 'null'}
	<Radio.Root value={null} data-testid="radio-null">None</Radio.Root>
	<Radio.Root value="a" data-testid="radio-a">A</Radio.Root>
{:else if scenario === 'object'}
	<Radio.Root value={first} data-testid="radio-a">One</Radio.Root>
	<Radio.Root value={second} data-testid="radio-b">Two</Radio.Root>
{:else if scenario === 'native'}
	<label data-testid="label" for="myRadio">A</label>
	<Radio.Root value="a" id="myRadio" nativeButton data-testid="radio-a">
		{#snippet render(props)}
			<button {...props}>A</button>
		{/snippet}
	</Radio.Root>
	<Radio.Root value="b" data-testid="radio-b">B</Radio.Root>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Pick A</span>
		<Radio.Root value="a" data-testid="radio-a">A</Radio.Root>
	</label>
	<Radio.Root value="b" data-testid="radio-b">B</Radio.Root>
{:else if scenario === 'bubble' || scenario === 'stop' || scenario === 'native-bubble' || scenario === 'native-stop'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div data-testid="parent" onclick={() => (parentClicks += 1)}>
		{#if scenario === 'native-bubble' || scenario === 'native-stop'}
			<Radio.Root value="a" nativeButton data-testid="radio-a" onclick={clicked}>
				{#snippet render(props)}
					<button {...props}>A</button>
				{/snippet}
			</Radio.Root>
		{:else}
			<Radio.Root value="a" data-testid="radio-a" onclick={clicked}>A</Radio.Root>
		{/if}
	</div>
{:else if scenario === 'prevented'}
	<Radio.Root value="a" data-testid="radio-a">A</Radio.Root>
	<Radio.Root value="b" data-testid="radio-b" onclick={(event) => event.preventDefault()}
		>B</Radio.Root
	>
{:else if scenario === 'form' || scenario === 'required'}
	<form {onsubmit}>
		<Radio.Root value="a" data-testid="radio-a">A</Radio.Root>
		<Radio.Root value="b" data-testid="radio-b">B</Radio.Root>
		<button type="submit">Submit</button>
	</form>
{:else}
	<Radio.Root value="a" data-testid="radio-a">A</Radio.Root>
	<Radio.Root value="b" data-testid="radio-b">B</Radio.Root>
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="value"
	>{checkedValue === undefined ? 'undefined' : JSON.stringify(checkedValue)}</output
>
<output data-testid="touched">{touched ? 'yes' : 'no'}</output>
<output data-testid="parent-clicks">{parentClicks}</output>
<output data-testid="values">{JSON.stringify(values)}</output>
<output data-testid="submitted">{submitted}</output>
