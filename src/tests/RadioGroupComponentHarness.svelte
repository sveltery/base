<script lang="ts">
	import {
		DirectionProvider,
		Field,
		Fieldset,
		Form,
		Radio,
		RadioGroup,
		type RadioGroupChangeEventDetails
	} from '#lib';
	import InitialColorGroup from '../routes/fixtures/radio-group/InitialColorGroup.svelte';

	type Scenario =
		| 'plain'
		| 'initial'
		| 'disabled'
		| 'readonly'
		| 'required'
		| 'cancel'
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

	const first = { id: 1 };
	const second = { id: 2 };

	let showLast = $state(true);
	let disableFirst = $state(false);
	let explicit = $state(true);
	let owner = $state<string | undefined>('b');
	let picked = $state<string | undefined>();
	let errors = $state<Record<string, string>>({ color: 'Pick one' });
	let calls = $state<{ value: string; reason: string; canceled: boolean; shiftKey: boolean }[]>([]);
	let submitted = $state(0);
	let externalValue = $state<string | null>(null);
	let attached = $state('none');

	function shiftKeyOf(event: Event) {
		return 'shiftKey' in event && Boolean((event as KeyboardEvent).shiftKey);
	}

	function record(next: unknown, details: RadioGroupChangeEventDetails) {
		if (scenario === 'cancel' || scenario === 'removal') details.cancel();
		calls = [
			...calls,
			{
				value: typeof next === 'string' ? next : JSON.stringify(next),
				reason: details.reason,
				canceled: details.isCanceled,
				shiftKey: shiftKeyOf(details.event)
			}
		];
	}

	function capture(node: HTMLElement) {
		attached = node.getAttribute('role') ?? 'empty';
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
				<RadioGroup aria-label="Colors" name="color" required onValueChange={record}>
					<Radio.Root value="a">A</Radio.Root>
					<Radio.Root value="b">B</Radio.Root>
				</RadioGroup>
				<button type="submit">Submit</button>
			</form>
		{:else if scenario === 'external'}
			<form id="external-form" {onsubmit}>
				<button type="submit">Submit</button>
			</form>
			<RadioGroup aria-label="Colors" name="color" form="external-form" value="b">
				<Radio.Root value="a">A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
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
						<Radio.Root value="a">A</Radio.Root>
						<Radio.Root value="b">B</Radio.Root>
					</RadioGroup>
					<Field.Error data-testid="error" />
				</Field.Root>
			</Form>
			<button type="button" onclick={() => (owner = 'a')}>Set A</button>
		{:else if scenario === 'errors'}
			<Form bind:errors>
				<RadioGroup aria-label="Colors" name="color">
					<Radio.Root value="a">A</Radio.Root>
					<Radio.Root value="b">B</Radio.Root>
				</RadioGroup>
			</Form>
		{:else if scenario === 'legend'}
			<span id="explicit-label">Explicit</span>
			<Fieldset.Root>
				<Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
				<RadioGroup {...explicit ? { 'aria-labelledby': 'explicit-label' } : {}}>
					<Radio.Root value="a">A</Radio.Root>
				</RadioGroup>
			</Fieldset.Root>
		{:else if scenario === 'labels'}
			<RadioGroup aria-label="Colors" onValueChange={record}>
				<label data-testid="label-a">
					<Radio.Root value="a" />
					Apple
				</label>
				<div>
					<label for="radio-b" data-testid="label-b">Banana</label>
					<Radio.Root value="b" id="radio-b" />
				</div>
			</RadioGroup>
		{:else if scenario === 'style'}
			<RadioGroup aria-label="Colors" value="a" disabled readOnly required>
				<Radio.Root value="a" data-testid="item">
					<Radio.Indicator data-testid="indicator" />
					A
				</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'object'}
			<RadioGroup aria-label="Colors" onValueChange={record}>
				<Radio.Root value={first}>A</Radio.Root>
				<Radio.Root value={second}>B</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'nullish'}
			<RadioGroup aria-label="Colors" onValueChange={record}>
				<Radio.Root value={null}>A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'render'}
			<RadioGroup value="b">
				{#snippet render(props, groupState)}
					<div
						{...props}
						data-testid="custom"
						data-readonly-state={groupState.readOnly ? 'yes' : 'no'}
					>
						<Radio.Root value="a">A</Radio.Root>
						<Radio.Root value="b">B</Radio.Root>
					</div>
				{/snippet}
			</RadioGroup>
		{:else if scenario === 'attach'}
			<RadioGroup aria-label="Colors" {@attach capture}>
				<Radio.Root value="a">A</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'override'}
			<RadioGroup role="group" id="group-id" data-testid="root" value="hidden">
				<Radio.Root value="a">A</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'name'}
			<RadioGroup aria-label="Colors" name="radio-group">
				<Radio.Root value="a" data-testid="radio">A</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'removal'}
			<RadioGroup aria-label="Colors" value="b" onValueChange={record}>
				<Radio.Root value="a" data-testid="a">A</Radio.Root>
				<Radio.Root value="b" data-testid="b">B</Radio.Root>
				{#if showLast}
					<Radio.Root value="c" data-testid="c">C</Radio.Root>
				{/if}
			</RadioGroup>
		{:else if scenario === 'late-disable'}
			<RadioGroup aria-label="Colors">
				<Radio.Root value="a" disabled={disableFirst}>A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
				<Radio.Root value="c">C</Radio.Root>
			</RadioGroup>
			<button type="button" onclick={() => (disableFirst = true)}>Disable A</button>
		{:else if scenario === 'disabled-item'}
			<RadioGroup aria-label="Colors">
				<Radio.Root value="a">A</Radio.Root>
				<Radio.Root value="b" disabled>B</Radio.Root>
				<Radio.Root value="c">C</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'keys'}
			<RadioGroup aria-label="Colors" onValueChange={record}>
				<Radio.Root value="a" data-testid="a">A</Radio.Root>
				<Radio.Root value="b" data-testid="b">B</Radio.Root>
				<Radio.Root value="c" data-testid="c">C</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'pick'}
			<input type="checkbox" aria-label="Owner B" checked={picked === 'b'} />
			<RadioGroup aria-label="Colors" bind:value={picked}>
				<Radio.Root value="a">A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
			</RadioGroup>
			<output data-testid="picked">{picked ?? 'none'}</output>
		{:else if scenario === 'controlled'}
			<RadioGroup aria-label="Colors" value={owner} onValueChange={record}>
				<Radio.Root value="a">A</Radio.Root>
				<Radio.Root value="b">B</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'default'}
			<RadioGroup aria-label="Colors" defaultValue="b">
				<Radio.Root value="a" data-testid="a">A</Radio.Root>
				<Radio.Root value="b" data-testid="b">B</Radio.Root>
			</RadioGroup>
		{:else if scenario === 'initial'}
			<InitialColorGroup />
		{:else}
			<RadioGroup
				aria-label="Colors"
				disabled={scenario === 'disabled'}
				readOnly={scenario === 'readonly'}
				onValueChange={record}
			>
				<Radio.Root value="a" data-testid="a">A</Radio.Root>
				<Radio.Root value="b" data-testid="b">B</Radio.Root>
			</RadioGroup>
		{/if}
	</div>
</DirectionProvider>

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="submitted">{submitted}</output>
<output data-testid="external">{externalValue ?? 'none'}</output>
<output data-testid="errors">{JSON.stringify(errors)}</output>
<output data-testid="attached">{attached}</output>
<output data-testid="owner">{owner ?? 'none'}</output>
