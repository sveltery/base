<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Form } from '#lib';
	import { submitTo } from '../routes/fixtures/form-log.js';
	import { portalTo } from './portal.js';

	let {
		scenario = 'mixed'
	}: {
		scenario?:
			| 'mixed'
			| 'enable'
			| 'remount'
			| 'no-value'
			| 'duplicates'
			| 'other-form'
			| 'fieldset'
			| 'no-form'
			| 'portal-checkbox'
			| 'portal-group'
			| 'portal-form-attr'
			| 'portal-required'
			| 'portal-other-form';
	} = $props();

	let values = $state('');
	let validated = $state('');
	let other = $state('');
	let formData = $state('');
	let disabled = $state(true);
	let mounted = $state(true);
	let trimmed = $state(false);
	let submits = $state(0);

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		submits += 1;
		values = JSON.stringify(formValues);
		const form = details.event.currentTarget;
		if (form instanceof HTMLFormElement) formData = JSON.stringify([...new FormData(form)]);
	}

	function validateGroup(value: unknown, formValues: Record<string, unknown>) {
		validated = `${JSON.stringify(value)} ${JSON.stringify(formValues)}`;
		return null;
	}

	function validateOther(_value: unknown, formValues: Record<string, unknown>) {
		other = JSON.stringify(formValues.fruits);
		return null;
	}
</script>

{#if scenario === 'no-form'}
	<Field.Root name="fruits" validationMode="onChange" validate={validateGroup}>
		<CheckboxGroup defaultValue={['apple', 'banana']}>
			<Checkbox.Root value="apple" />
			<Checkbox.Root value="banana" disabled />
			<Checkbox.Root value="cherry" data-testid="cherry" />
		</CheckboxGroup>
	</Field.Root>
{:else}
	<Form
		onsubmit={submitTo(accept, ['fruits', 'items', 'colors'])}
		id={scenario === 'portal-form-attr' ? 'current-form' : undefined}
	>
		{#if scenario === 'mixed'}
			<Field.Root name="colors" validate={validateGroup}>
				<CheckboxGroup data-testid="group" defaultValue={['red', 'green', 'blue']}>
					<Checkbox.Root value="red" />
					<Checkbox.Root value="green" disabled />
					<Checkbox.Root value="blue" form="elsewhere" data-testid="blue" />
				</CheckboxGroup>
			</Field.Root>
		{:else if scenario === 'no-value'}
			<Field.Root name="fruits">
				<CheckboxGroup defaultValue={['fruits']}>
					<Checkbox.Root />
				</CheckboxGroup>
			</Field.Root>
		{:else if scenario === 'duplicates'}
			<Field.Root name="items">
				<CheckboxGroup defaultValue={['one', 'two']}>
					{#if !trimmed}<Checkbox.Root value="one" />{/if}
					<Checkbox.Root value="two" />
					{#if !trimmed}<Checkbox.Root value="two" />{/if}
				</CheckboxGroup>
			</Field.Root>
			<button type="button" onclick={() => (trimmed = true)}>Trim</button>
		{:else if scenario === 'portal-checkbox' || scenario === 'portal-form-attr'}
			<Field.Root name="fruits">
				<CheckboxGroup defaultValue={['apple']}>
					<div {@attach portalTo('div')}>
						<Checkbox.Root
							value="apple"
							form={scenario === 'portal-form-attr' ? 'current-form' : undefined}
						/>
					</div>
				</CheckboxGroup>
			</Field.Root>
		{:else if scenario === 'portal-group'}
			<div {@attach portalTo('div')}>
				<Field.Root name="fruits">
					<CheckboxGroup defaultValue={['apple', 'banana']}>
						<Checkbox.Root value="apple" />
						<Checkbox.Root value="banana" disabled />
					</CheckboxGroup>
				</Field.Root>
			</div>
		{:else if scenario === 'portal-required'}
			<Field.Root name="group">
				<CheckboxGroup defaultValue={[]}>
					<div {@attach portalTo('div')}>
						<Checkbox.Root value="portaled" required data-testid="portaled" />
					</div>
					<Checkbox.Root value="current" />
				</CheckboxGroup>
			</Field.Root>
		{:else if scenario === 'portal-other-form'}
			<Field.Root name="group">
				<CheckboxGroup defaultValue={[]}>
					<div {@attach portalTo('form')}><Checkbox.Root value="external" required /></div>
				</CheckboxGroup>
			</Field.Root>
		{:else}
			<Field.Root name="fruits" validate={validateGroup}>
				<CheckboxGroup defaultValue={['apple', 'banana']}>
					<Checkbox.Root value="apple" />
					{#if scenario === 'enable'}
						<Checkbox.Root value="banana" {disabled} />
					{:else if scenario === 'remount'}
						{#if mounted}<Checkbox.Root value="banana" data-testid="banana" />{/if}
					{:else if scenario === 'other-form'}
						<Checkbox.Root value="banana" form="elsewhere" />
					{:else}
						<fieldset disabled><Checkbox.Root value="banana" /></fieldset>
					{/if}
				</CheckboxGroup>
			</Field.Root>
			<Field.Root name="other" validate={validateOther}>
				<Field.Control defaultValue="value" />
			</Field.Root>
			<button type="button" onclick={() => (disabled = false)}>Enable</button>
			<button type="button" onclick={() => (mounted = !mounted)}>Toggle</button>
		{/if}
		<button type="submit">Submit</button>
	</Form>
{/if}
<form id="elsewhere"></form>
<output data-testid="values">{values}</output>
<output data-testid="validated">{validated}</output>
<output data-testid="other">{other}</output>
<output data-testid="form-data">{formData}</output>
<output data-testid="submits">{submits}</output>
