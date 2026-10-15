<script lang="ts">
	import { Field, Form, Radio, RadioGroup } from '#lib';
	import { portalTo } from './portal.js';

	let {
		scenario
	}: {
		scenario:
			| 'disable'
			| 'initially-disabled'
			| 'enabled'
			| 'fieldset'
			| 'other-form'
			| 'required-disabled'
			| 'no-form'
			| 'portal-radio'
			| 'portal-group';
	} = $props();

	const startsDisabled = ['initially-disabled', 'required-disabled', 'no-form'];
	let toggled = $state(false);
	const disabled = $derived(startsDisabled.includes(scenario) !== toggled);
	let fieldsetDisabled = $state(true);
	let values = $state('');
	let other = $state('');

	function accept(formValues: Record<string, unknown>) {
		values = JSON.stringify(formValues);
	}

	function validateOther(_value: unknown, formValues: Record<string, unknown>) {
		other = JSON.stringify(formValues.choice);
		return null;
	}
</script>

{#snippet radios()}
	<Radio.Root value="a" {disabled} data-testid="item-a" />
	<Radio.Root value="b" data-testid="item-b" />
{/snippet}

{#if scenario === 'no-form'}
	<Field.Root name="choice">
		<RadioGroup defaultValue="a">{@render radios()}</RadioGroup>
	</Field.Root>
	<Field.Root name="other" validationMode="onChange" validate={validateOther}>
		<Field.Control data-testid="other-control" />
	</Field.Root>
{:else}
	<Form onFormSubmit={accept} data-testid="form">
		{#if scenario === 'disable' || scenario === 'initially-disabled'}
			<Field.Root name="test">
				<RadioGroup name="group" defaultValue="a">{@render radios()}</RadioGroup>
			</Field.Root>
		{:else if scenario === 'fieldset'}
			<fieldset disabled={fieldsetDisabled}>
				<Field.Root name="choice">
					<RadioGroup defaultValue="a">{@render radios()}</RadioGroup>
				</Field.Root>
			</fieldset>
		{:else if scenario === 'required-disabled'}
			<Field.Root name="choice">
				<RadioGroup required defaultValue="a">{@render radios()}</RadioGroup>
				<Field.Error match="valueMissing" data-testid="error">required</Field.Error>
			</Field.Root>
		{:else if scenario === 'portal-radio'}
			<Field.Root name="choice">
				<RadioGroup defaultValue="a">
					<div {@attach portalTo('div')}><Radio.Root value="a" /></div>
				</RadioGroup>
			</Field.Root>
		{:else if scenario === 'portal-group'}
			<div {@attach portalTo('div')}>
				<Field.Root name="choice">
					<RadioGroup defaultValue="a">
						<Radio.Root value="a" />
						<Radio.Root value="b" />
					</RadioGroup>
				</Field.Root>
			</div>
		{:else}
			<Field.Root name="choice">
				<RadioGroup form={scenario === 'other-form' ? 'external-form' : undefined} defaultValue="a">
					{@render radios()}
				</RadioGroup>
			</Field.Root>
		{/if}
		<button type="button" onclick={() => (toggled = !toggled)}>Toggle disabled</button>
		<button type="button" onclick={() => (fieldsetDisabled = false)}>Enable</button>
		<button type="submit">Submit</button>
	</Form>
{/if}
<form id="external-form"></form>
<output data-testid="values">{values}</output>
<output data-testid="other">{other}</output>
