<script lang="ts">
	import {
		Checkbox,
		CheckboxGroup,
		Field,
		Form,
		Input,
		NumberField,
		OTPField,
		Radio,
		RadioGroup,
		Slider,
		Switch
	} from '#lib';

	type ResetScenario =
		| 'checkbox'
		| 'switch'
		| 'radio-group'
		| 'checkbox-group'
		| 'slider'
		| 'range-slider'
		| 'input'
		| 'bare-input'
		| 'number-field'
		| 'otp-field'
		| 'field-state'
		| 'checkbox-field-state';

	let { scenario }: { scenario: ResetScenario } = $props();

	const box = 'display: inline-block; width: 16px; height: 16px';

	let checked = $state<boolean | undefined>();
	let picked = $state<unknown>();
	let tags = $state<string[] | undefined>();
	let volume = $state<number | number[] | undefined>();
	let text = $state<string | number | null | undefined>();
	let seats = $state<number | null | undefined>();
	let code = $state<string | undefined>();
	let errors = $state<Record<string, string>>({});
</script>

{#if scenario === 'field-state' || scenario === 'checkbox-field-state'}
	<Form data-testid="form" bind:errors>
		<Field.Root
			name="email"
			validationMode="onBlur"
			validate={(value) => (value === 'bad' ? 'Not allowed' : null)}
			data-testid="field"
		>
			{#if scenario === 'field-state'}
				<Field.Control data-testid="control" bind:value={text} />
			{:else}
				<Checkbox.Root data-testid="control" style={box} bind:checked />
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="button" onclick={() => (errors = { email: 'Taken' })}>Server error</button>
		<button type="reset">Reset</button>
	</Form>
{:else}
	<form data-testid="form">
		{#if scenario === 'checkbox'}
			<Checkbox.Root name="tos" defaultChecked bind:checked data-testid="control" style={box} />
		{:else if scenario === 'switch'}
			<Switch.Root name="alerts" defaultChecked bind:checked data-testid="control" style={box} />
		{:else if scenario === 'radio-group'}
			<RadioGroup name="plan" defaultValue="free" bind:value={picked}>
				<Radio.Root value="free" data-testid="free" style={box} />
				<Radio.Root value="pro" data-testid="pro" style={box} />
			</RadioGroup>
		{:else if scenario === 'checkbox-group'}
			<CheckboxGroup defaultValue={['svelte']} bind:value={tags}>
				<Checkbox.Root name="tags" value="svelte" data-testid="svelte" style={box} />
				<Checkbox.Root name="tags" value="kit" data-testid="kit" style={box} />
			</CheckboxGroup>
		{:else if scenario === 'slider' || scenario === 'range-slider'}
			<Slider.Root
				name="volume"
				defaultValue={scenario === 'slider' ? 30 : [20, 80]}
				bind:value={volume}
			>
				<Slider.Control>
					<Slider.Track>
						<Slider.Thumb index={scenario === 'slider' ? undefined : 0} />
						{#if scenario === 'range-slider'}<Slider.Thumb index={1} />{/if}
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		{:else if scenario === 'input'}
			<Field.Root name="email">
				<Field.Control defaultValue="hello" bind:value={text} data-testid="control" />
			</Field.Root>
		{:else if scenario === 'bare-input'}
			<Input name="note" defaultValue="hello" bind:value={text} data-testid="control" />
		{:else if scenario === 'number-field'}
			<NumberField.Root name="seats" defaultValue={5} bind:value={seats}>
				<NumberField.Group>
					<NumberField.Decrement>-</NumberField.Decrement>
					<NumberField.Input data-testid="control" />
					<NumberField.Increment>+</NumberField.Increment>
				</NumberField.Group>
			</NumberField.Root>
		{:else if scenario === 'otp-field'}
			<OTPField.Root name="code" length={4} defaultValue="12" bind:value={code}>
				{#each [0, 1, 2, 3] as index (index)}
					<OTPField.Input data-testid={`slot-${index}`} />
				{/each}
			</OTPField.Root>
		{/if}
		<button type="reset">Reset</button>
	</form>
{/if}
<output data-testid="state"
	>{JSON.stringify({ checked, picked, tags, volume, text, seats, code })}</output
>
