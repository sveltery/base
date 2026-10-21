<script lang="ts">
	import { DirectionProvider, Field, Fieldset, Form, Radio, RadioGroup } from '#lib';
	import InitialColorGroup from '../routes/fixtures/radio-group/InitialColorGroup.svelte';

	type Scenario =
		| 'plain'
		| 'initial'
		| 'disabled'
		| 'disabled-checked'
		| 'readonly'
		| 'required'
		| 'cancel'
		| 'cancel-selected'
		| 'readonly-label'
		| 'style'
		| 'name'
		| 'keys'
		| 'removal'
		| 'disabled-item'
		| 'late-disable'
		| 'labels'
		| 'legend'
		| 'external'
		| 'errors'
		| 'controlled'
		| 'pick'
		| 'parent'
		| 'object'
		| 'nullish'
		| 'render'
		| 'attach'
		| 'override'
		| 'default';

	let {
		scenario = 'plain',
		dir = 'ltr'
	}: {
		scenario?: Scenario;
		dir?: 'ltr' | 'rtl';
	} = $props();

	// The boxes have no content of their own, so the harness gives them a size to click.
	const box = 'display: inline-block; width: 16px; height: 16px';
	const first = { id: 1 };
	const second = { id: 2 };

	let showLast = $state(true);
	let disableFirst = $state(false);
	let explicit = $state(true);
	let owner = $state<string | undefined>('b');
	let picked = $state<string | undefined>();
	let errors = $state<Record<string, string>>({ color: 'Pick one' });
	/** The `value` of each input whose `change` event reached the group, in order. */
	let changes = $state<string[]>([]);
	let submitted = $state(0);
	let externalValue = $state<string | null>(null);
	let attached = $state('none');

	function record(event: Event) {
		if (event.target instanceof HTMLInputElement) changes = [...changes, event.target.value];
	}

	// A canceled click keeps the selection, as `onValueChange` with `cancel()` did upstream.
	const prevent = $derived(
		scenario === 'cancel' || scenario === 'cancel-selected' || scenario === 'removal'
			? (event: MouseEvent) => event.preventDefault()
			: undefined
	);

	function capture(node: HTMLElement) {
		attached = node.tagName.toLowerCase();
		return () => {
			attached = 'none';
		};
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const entry = new FormData(form).get('color');
		externalValue = typeof entry === 'string' ? entry : null;
	}
</script>

<DirectionProvider direction={dir}>
	<div {dir}>
		{#if scenario === 'controlled'}
			<button type="button" onclick={() => (owner = 'a')}>Set A</button>
			<button type="button" onclick={() => (owner = undefined)}>Clear</button>
			<button type="button" onclick={() => (owner = 'b')}>Set B</button>
		{/if}
		{#if scenario === 'removal'}
			<button type="button" onclick={() => (showLast = false)}>Hide</button>
		{/if}
		{#if scenario === 'legend'}
			<button type="button" onclick={() => (explicit = false)}>Remove explicit</button>
		{/if}

		{#if scenario === 'required'}
			<form {onsubmit}>
				<RadioGroup aria-label="Colors" name="color" required onchange={record}>
					<Radio.Root style={box} value="a" aria-label="A" />
					<Radio.Root style={box} value="b" aria-label="B" />
				</RadioGroup>
				<button type="submit">Submit</button>
			</form>
		{:else if scenario === 'external'}
			<form id="external-form" {onsubmit}>
				<button type="submit">Submit</button>
			</form>
			<RadioGroup aria-label="Colors" name="color" form="external-form" value="b">
				<Radio.Root style={box} value="a" aria-label="A" />
				<Radio.Root style={box} value="b" aria-label="B" />
			</RadioGroup>
		{:else if scenario === 'parent'}
			<Form bind:errors>
				<Field.Root
					name="color"
					validationMode="onChange"
					data-testid="field"
					validate={(next) => (next === 'a' ? 'nope' : null)}
				>
					<RadioGroup aria-label="Colors" name="color" value={owner}>
						<Radio.Root style={box} value="a" aria-label="A" />
						<Radio.Root style={box} value="b" aria-label="B" />
					</RadioGroup>
					<Field.Error data-testid="error" />
				</Field.Root>
			</Form>
			<button type="button" onclick={() => (owner = 'a')}>Set A</button>
		{:else if scenario === 'errors'}
			<Form bind:errors>
				<RadioGroup aria-label="Colors" name="color">
					<Radio.Root style={box} value="a" aria-label="A" />
					<Radio.Root style={box} value="b" aria-label="B" />
				</RadioGroup>
			</Form>
		{:else if scenario === 'legend'}
			<span id="explicit-label">Explicit</span>
			<RadioGroup {...explicit ? { 'aria-labelledby': 'explicit-label' } : {}}>
				<Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
				<Radio.Root style={box} value="a" aria-label="A" />
			</RadioGroup>
		{:else if scenario === 'labels'}
			<RadioGroup aria-label="Colors" onchange={record}>
				<label data-testid="label-a">
					<Radio.Root style={box} value="a" />
					Apple
				</label>
				<div>
					<label for="radio-b" data-testid="label-b">Banana</label>
					<Radio.Root style={box} value="b" id="radio-b" />
				</div>
			</RadioGroup>
		{:else if scenario === 'style'}
			<RadioGroup aria-label="Colors" value="a" disabled readonly required>
				<Radio.Root style={box} value="a" aria-label="A" host={{ 'data-testid': 'item' }}>
					<Radio.Indicator data-testid="indicator" />
				</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'object'}
			<RadioGroup aria-label="Colors" onchange={record}>
				<Radio.Root style={box} value={first} aria-label="A" />
				<Radio.Root style={box} value={second} aria-label="B" />
			</RadioGroup>
		{:else if scenario === 'nullish'}
			<RadioGroup aria-label="Colors" onchange={record}>
				<Radio.Root style={box} value={null} aria-label="A" />
				<Radio.Root style={box} value="b" aria-label="B" />
			</RadioGroup>
		{:else if scenario === 'render'}
			<RadioGroup value="b">
				{#snippet render(props, groupState)}
					<fieldset
						{...props}
						data-testid="custom"
						data-readonly-state={groupState.readOnly ? 'yes' : 'no'}
					>
						<Radio.Root style={box} value="a" aria-label="A" />
						<Radio.Root style={box} value="b" aria-label="B" />
					</fieldset>
				{/snippet}
			</RadioGroup>
		{:else if scenario === 'attach'}
			<RadioGroup aria-label="Colors" {@attach capture}>
				<Radio.Root style={box} value="a" aria-label="A" />
			</RadioGroup>
		{:else if scenario === 'override'}
			<RadioGroup role="group" id="group-id" data-testid="root" value="hidden">
				<Radio.Root style={box} value="a" aria-label="A" />
			</RadioGroup>
		{:else if scenario === 'name'}
			<RadioGroup aria-label="Colors" name="radio-group">
				<Radio.Root style={box} value="a" data-testid="radio" aria-label="A" />
			</RadioGroup>
		{:else if scenario === 'removal'}
			<RadioGroup aria-label="Colors" value="b" onchange={record}>
				<Radio.Root style={box} value="a" data-testid="a" aria-label="A" onclick={prevent} />
				<Radio.Root style={box} value="b" data-testid="b" aria-label="B" onclick={prevent} />
				{#if showLast}
					<Radio.Root style={box} value="c" data-testid="c" aria-label="C" onclick={prevent} />
				{/if}
			</RadioGroup>
		{:else if scenario === 'late-disable'}
			<RadioGroup aria-label="Colors">
				<Radio.Root style={box} value="a" disabled={disableFirst} aria-label="A" />
				<Radio.Root style={box} value="b" aria-label="B" />
				<Radio.Root style={box} value="c" aria-label="C" />
			</RadioGroup>
			<button type="button" onclick={() => (disableFirst = true)}>Disable A</button>
		{:else if scenario === 'disabled-item'}
			<RadioGroup aria-label="Colors">
				<Radio.Root style={box} value="a" aria-label="A" />
				<Radio.Root style={box} value="b" disabled aria-label="B" />
				<Radio.Root style={box} value="c" aria-label="C" />
			</RadioGroup>
		{:else if scenario === 'keys'}
			<RadioGroup aria-label="Colors" onchange={record}>
				<Radio.Root style={box} value="a" data-testid="a" aria-label="A" />
				<Radio.Root style={box} value="b" data-testid="b" aria-label="B" />
				<Radio.Root style={box} value="c" data-testid="c" aria-label="C" />
			</RadioGroup>
		{:else if scenario === 'pick'}
			<input type="checkbox" aria-label="Owner B" checked={picked === 'b'} />
			<RadioGroup aria-label="Colors" bind:value={picked}>
				<Radio.Root style={box} value="a" aria-label="A" />
				<Radio.Root style={box} value="b" aria-label="B" />
			</RadioGroup>
			<output data-testid="picked">{picked ?? 'none'}</output>
		{:else if scenario === 'controlled'}
			<RadioGroup aria-label="Colors" value={owner} onchange={record}>
				<Radio.Root style={box} value="a" aria-label="A" />
				<Radio.Root style={box} value="b" aria-label="B" />
			</RadioGroup>
		{:else if scenario === 'default'}
			<RadioGroup aria-label="Colors" defaultValue="b">
				<Radio.Root style={box} value="a" data-testid="a" aria-label="A" />
				<Radio.Root style={box} value="b" data-testid="b" aria-label="B" />
			</RadioGroup>
		{:else if scenario === 'cancel-selected'}
			<RadioGroup aria-label="Colors" name="color" defaultValue="b" onchange={record}>
				<Radio.Root style={box} value="a" aria-label="A" onclick={prevent} />
				<Radio.Root style={box} value="b" aria-label="B" onclick={prevent} />
			</RadioGroup>
		{:else if scenario === 'readonly-label'}
			<form data-testid="form">
				<RadioGroup aria-label="Colors" name="color" defaultValue="b" readonly>
					<label>
						<Radio.Root style={box} value="a" />
						Label A
					</label>
					<Radio.Root style={box} value="b" aria-label="B" />
				</RadioGroup>
			</form>
		{:else if scenario === 'initial'}
			<InitialColorGroup />
		{:else if scenario === 'disabled-checked'}
			<RadioGroup aria-label="Colors" defaultValue="b" disabled>
				<Radio.Root style={box} value="a" aria-label="A" />
				<Radio.Root style={box} value="b" aria-label="B" />
			</RadioGroup>
		{:else}
			<RadioGroup
				aria-label="Colors"
				disabled={scenario === 'disabled'}
				readonly={scenario === 'readonly'}
				onchange={record}
			>
				<Radio.Root style={box} value="a" data-testid="a" aria-label="A" onclick={prevent} />
				<Radio.Root style={box} value="b" data-testid="b" aria-label="B" onclick={prevent} />
			</RadioGroup>
		{/if}
	</div>
</DirectionProvider>

<output data-testid="changes">{JSON.stringify(changes)}</output>
<output data-testid="submitted">{submitted}</output>
<output data-testid="external">{externalValue ?? 'none'}</output>
<output data-testid="errors">{JSON.stringify(errors)}</output>
<output data-testid="attached">{attached}</output>
<output data-testid="owner">{owner ?? 'none'}</output>
