<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Fieldset, Form, Radio, RadioGroup, Switch } from '#lib';
	import { submitTo, takeForm } from '../routes/fixtures/form-log.js';

	let {
		scenario
	}: {
		scenario:
			| 'checkbox'
			| 'switch'
			| 'radio-group'
			| 'checkbox-group'
			| 'radio-item'
			| 'wrapping-labels'
			| 'fieldset-items'
			| 'group-legend';
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

<Form onsubmit={submitTo(accept)}>
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
				<Radio.Root value="free" data-testid="free" aria-label="Free" style={box} />
				<Radio.Root value="pro" data-testid="pro" aria-label="Pro" style={box} />
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
	{:else if scenario === 'wrapping-labels'}
		<Field.Root name="tos">
			<Field.Label>
				<Checkbox.Root data-testid="checkbox" style={box} />
				Accept terms
			</Field.Label>
		</Field.Root>
		<Field.Root name="restart">
			<Field.Label>
				Restart on failure
				<Switch.Root data-testid="switch" style={box} />
			</Field.Label>
		</Field.Root>
		<Field.Root name="storage">
			<RadioGroup data-testid="control">
				{#each ['ssd', 'hdd'] as value (value)}
					<Field.Item>
						<Field.Label>
							<Radio.Root {value} data-testid={value} style={box} />
							{value.toUpperCase()}
						</Field.Label>
					</Field.Item>
				{/each}
			</RadioGroup>
		</Field.Root>
	{:else if scenario === 'fieldset-items'}
		<Field.Root name="backup">
			<Fieldset.Root data-testid="fieldset">
				<Fieldset.Legend data-testid="legend">Backup schedule</Fieldset.Legend>
				<CheckboxGroup data-testid="control">
					{#each [['daily', 'Daily at 00:00'], ['monthly', 'On the 5th at 23:59']] as [value, when] (value)}
						<Field.Item>
							<Checkbox.Root {value} data-testid={value} style={box} />
							<Field.Label>{value}</Field.Label>
							<Field.Description data-testid="{value}-description">{when}</Field.Description>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			</Fieldset.Root>
		</Field.Root>
	{:else if scenario === 'group-legend'}
		<Field.Root name="protocols">
			<CheckboxGroup data-testid="control">
				<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
				<Checkbox.Root value="http" data-testid="http" style={box} />
			</CheckboxGroup>
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
