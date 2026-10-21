<script lang="ts">
	import { untrack } from 'svelte';
	import { Radio } from '#lib';
	import { useLabelableContext } from '#lib/internal/labelable-provider.svelte.js';
	import { setRadioGroupContext } from '#lib/radio/group-context.js';

	let {
		scenario = 'select'
	}: {
		scenario?:
			| 'select'
			| 'null'
			| 'disabled'
			| 'readonly'
			| 'required'
			| 'bubble'
			| 'stop'
			| 'label'
			| 'touched'
			| 'form'
			| 'object'
			| 'prevented';
	} = $props();

	// The boxes have no content of their own, so the harness gives them a size to click.
	const box = 'display: inline-block; width: 16px; height: 16px';
	const first = { id: 1 };
	const second = { id: 2 };
	const initial = untrack(() => scenario);
	const open =
		initial === 'required' ||
		initial === 'null' ||
		initial === 'object' ||
		initial === 'bubble' ||
		initial === 'stop';

	// Raw state keeps the radio's value reference. Proxied $state would break ===.
	let checkedValue = $state.raw<unknown>(open ? undefined : initial === 'label' ? 'b' : 'a');
	let touched = $state(initial === 'touched');
	/** Each value the group selected, as JSON. */
	let calls = $state<string[]>([]);
	let values = $state<(string | null)[]>([]);
	let submitted = $state(0);
	let parentClicks = $state(0);

	const groupName = initial === 'form' || initial === 'required' ? 'color' : undefined;

	setRadioGroupContext({
		labelable: useLabelableContext(),
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
		setCheckedValue(next: unknown) {
			calls.push(JSON.stringify(next));
			checkedValue = next;
		},
		setTouched(next: boolean) {
			touched = next;
		}
	});

	function clicked(event: MouseEvent) {
		if (scenario === 'stop') event.stopPropagation();
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
	<Radio.Root value={null} data-testid="radio-null" aria-label="None" style={box} />
	<Radio.Root value="a" data-testid="radio-a" aria-label="A" style={box} />
{:else if scenario === 'object'}
	<Radio.Root value={first} data-testid="radio-a" aria-label="One" style={box} />
	<Radio.Root value={second} data-testid="radio-b" aria-label="Two" style={box} />
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Pick A</span>
		<Radio.Root value="a" data-testid="radio-a" aria-label="A" style={box} />
	</label>
	<Radio.Root value="b" data-testid="radio-b" aria-label="B" style={box} />
{:else if scenario === 'bubble' || scenario === 'stop'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div data-testid="parent" onclick={() => (parentClicks += 1)}>
		<Radio.Root value="a" data-testid="radio-a" onclick={clicked} aria-label="A" style={box} />
	</div>
{:else if scenario === 'prevented'}
	<Radio.Root value="a" data-testid="radio-a" aria-label="A" style={box} />
	<Radio.Root
		value="b"
		data-testid="radio-b"
		aria-label="B"
		style={box}
		onclick={(event) => event.preventDefault()}
	/>
{:else if scenario === 'form' || scenario === 'required'}
	<form {onsubmit}>
		<Radio.Root value="a" data-testid="radio-a" aria-label="A" style={box} />
		<Radio.Root value="b" data-testid="radio-b" aria-label="B" style={box} />
		<button type="submit">Submit</button>
	</form>
{:else}
	<Radio.Root value="a" data-testid="radio-a" aria-label="A" style={box} />
	<Radio.Root value="b" data-testid="radio-b" aria-label="B" style={box} />
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="value"
	>{checkedValue === undefined ? 'undefined' : JSON.stringify(checkedValue)}</output
>
<output data-testid="touched">{touched ? 'yes' : 'no'}</output>
<output data-testid="parent-clicks">{parentClicks}</output>
<output data-testid="values">{JSON.stringify(values)}</output>
<output data-testid="submitted">{submitted}</output>
