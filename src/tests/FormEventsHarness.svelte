<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import {
		Checkbox,
		CheckboxGroup,
		Field,
		Form,
		isSubmitBlocked,
		NumberField,
		OTPField,
		Radio,
		RadioGroup,
		Slider,
		Switch
	} from '#lib';

	type EventsScenario =
		| 'gate'
		| 'slider'
		| 'number-field'
		| 'kept-number-field'
		| 'otp-field'
		| 'checkbox'
		| 'switch'
		| 'radio-group'
		| 'checkbox-parent';

	let { scenario }: { scenario: EventsScenario } = $props();

	const box = 'display: inline-block; width: 16px; height: 16px';

	let log = $state<string[]>([]);
	// `defaultPrevented` as each later submit listener call saw it.
	let submits = $state<boolean[]>([]);
	// `isSubmitBlocked` as each later submit listener call read it.
	let blocked = $state<boolean[]>([]);

	function record(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || !target.name) return;
		const value =
			target.type === 'checkbox' || target.type === 'radio' ? target.checked : target.value;
		log.push(`${event.type} ${target.name}=${value}`);
	}

	// A bubble-phase listener added after Form's own, as a form library's `enhance` is. It
	// prevents the submit only after recording, so the page does not navigate.
	const laterSubmitListener: Attachment<HTMLFormElement> = (node) => {
		const listener = (event: SubmitEvent) => {
			submits.push(event.defaultPrevented);
			blocked.push(isSubmitBlocked(node));
			event.preventDefault();
		};
		node.addEventListener('submit', listener);
		return () => node.removeEventListener('submit', listener);
	};
</script>

{#if scenario === 'gate'}
	<Form data-testid="form" {@attach laterSubmitListener}>
		<Field.Root name="email">
			<Field.Control data-testid="control" required />
		</Field.Root>
		<button type="submit">Submit</button>
		<button type="submit" formnovalidate>Skip validation</button>
	</Form>
{:else}
	<form data-testid="form" oninput={record} onchange={record}>
		{#if scenario === 'slider'}
			<Slider.Root name="volume" defaultValue={30}>
				<Slider.Control data-testid="slider-control">
					<Slider.Track>
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		{:else if scenario === 'number-field'}
			<NumberField.Root name="seats" defaultValue={5}>
				<NumberField.Group>
					<NumberField.Decrement>-</NumberField.Decrement>
					<NumberField.Input data-testid="control" />
					<NumberField.Increment>+</NumberField.Increment>
				</NumberField.Group>
			</NumberField.Root>
		{:else if scenario === 'kept-number-field'}
			<NumberField.Root
				name="seats"
				bind:value={() => 5, () => {}}
				onValueCommitted={(next) => log.push(`committed ${next}`)}
			>
				<NumberField.Group>
					<NumberField.Input data-testid="control" />
					<NumberField.Increment>+</NumberField.Increment>
				</NumberField.Group>
			</NumberField.Root>
		{:else if scenario === 'otp-field'}
			<OTPField.Root name="code" length={3}>
				{#each [0, 1, 2] as index (index)}
					<OTPField.Input data-testid={`slot-${index}`} />
				{/each}
			</OTPField.Root>
		{:else if scenario === 'checkbox'}
			<Checkbox.Root name="tos" data-testid="control" style={box} />
		{:else if scenario === 'switch'}
			<Switch.Root name="alerts" data-testid="control" style={box} />
		{:else if scenario === 'checkbox-parent'}
			<CheckboxGroup allValues={['a', 'b']} defaultValue={['a']}>
				<Checkbox.Root parent data-testid="parent" style={box} />
				<Checkbox.Root name="tag-a" value="a" style={box} />
				<Checkbox.Root name="tag-b" value="b" style={box} />
			</CheckboxGroup>
		{:else if scenario === 'radio-group'}
			<RadioGroup name="plan" defaultValue="free">
				<Radio.Root value="free" data-testid="free" style={box} />
				<Radio.Root value="pro" data-testid="pro" style={box} />
			</RadioGroup>
		{/if}
		<button type="button">Elsewhere</button>
	</form>
{/if}
<output data-testid="log">{JSON.stringify(log)}</output>
<output data-testid="submits">{JSON.stringify(submits)}</output>
<output data-testid="blocked">{JSON.stringify(blocked)}</output>
