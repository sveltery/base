<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Form, Radio, RadioGroup, Switch } from '#lib';
	import { takeForm } from '../routes/fixtures/form-log.js';

	let {
		scenario
	}: {
		scenario: 'checkbox' | 'switch' | 'radio-group' | 'checkbox-group' | 'radio-item';
	} = $props();

	const box = 'display: inline-block; width: 16px; height: 16px';

	let submitted = $state(0);
	let values = $state('');
	let formData = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
		const form = details.event.currentTarget;
		if (form instanceof HTMLFormElement) formData = JSON.stringify([...new FormData(form)]);
	}
</script>

<Form onFormSubmit={accept}>
	{#if scenario === 'checkbox'}
		<Field.Root name="tos" data-testid="field">
			<Field.Label data-testid="label">Accept terms</Field.Label>
			<Checkbox.Root required data-testid="control" style={box} />
			<Field.Description data-testid="description">Required</Field.Description>
		</Field.Root>
	{:else if scenario === 'switch'}
		<Field.Root name="alerts" data-testid="field">
			<Field.Label data-testid="label">Alerts</Field.Label>
			<Switch.Root required data-testid="control" style={box} />
			<Field.Description data-testid="description">Required</Field.Description>
		</Field.Root>
	{:else if scenario === 'radio-group'}
		<Field.Root name="plan" data-testid="field">
			<Field.Label data-testid="label">Plan</Field.Label>
			<RadioGroup required data-testid="control">
				<Radio.Root value="free" data-testid="free">Free</Radio.Root>
				<Radio.Root value="pro" data-testid="pro">Pro</Radio.Root>
			</RadioGroup>
			<Field.Description data-testid="description">Required</Field.Description>
		</Field.Root>
	{:else if scenario === 'radio-item'}
		<Field.Root name="plan" data-testid="field">
			<RadioGroup data-testid="control">
				<Field.Item>
					<Radio.Root value="free" data-testid="free" style={box} />
					<Field.Label data-testid="label">Free</Field.Label>
				</Field.Item>
			</RadioGroup>
		</Field.Root>
	{:else}
		<Field.Root
			name="tags"
			data-testid="field"
			validate={(value) => (Array.isArray(value) && value.length > 0 ? null : 'Pick one')}
		>
			<Field.Label data-testid="label">Tags</Field.Label>
			<CheckboxGroup data-testid="control">
				<Checkbox.Root value="svelte" data-testid="svelte" style={box} />
				<Checkbox.Root value="kit" data-testid="kit" style={box} />
			</CheckboxGroup>
			<Field.Error data-testid="error" />
		</Field.Root>
	{/if}
	<button type="submit">Submit</button>
</Form>
<output data-testid="submitted">{submitted}</output>
<output data-testid="values">{values}</output>
<output data-testid="form-data">{formData}</output>
