<script lang="ts">
	import { Field, Form, NumberField } from '#lib';
	import type { NumberFieldCase } from './cases.js';

	let { scenario }: { scenario: NumberFieldCase } = $props();

	let value = $state<number | null>(4);
	let submitted = $state(0);

	function accept(_formValues: Record<string, unknown>, details: { event: Event }) {
		details.event.preventDefault();
		submitted += 1;
	}
</script>

{#if scenario === 'plain'}
	<NumberField.Root locale="en-US" defaultValue={4}>
		<NumberField.Group>
			<NumberField.Decrement />
			<NumberField.Input data-testid="control" />
			<NumberField.Increment />
		</NumberField.Group>
	</NumberField.Root>
{:else if scenario === 'labelled'}
	<Field.Root data-testid="field">
		<Field.Label data-testid="label">Amount</Field.Label>
		<NumberField.Root locale="en-US">
			<NumberField.Input data-testid="control" />
		</NumberField.Root>
	</Field.Root>
{:else if scenario === 'bound'}
	<NumberField.Root locale="en-US" bind:value>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
	</NumberField.Root>
	<output data-testid="value">{value}</output>
{:else if scenario === 'formatted'}
	<Field.Root name="price">
		<NumberField.Root
			locale="de-DE"
			defaultValue={54.5}
			format={{ style: 'currency', currency: 'EUR' }}
		>
			<NumberField.Input data-testid="control" />
		</NumberField.Root>
	</Field.Root>
{:else if scenario === 'disabled'}
	<NumberField.Root locale="en-US" defaultValue={4} disabled data-testid="root">
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
	</NumberField.Root>
{:else}
	<Form onFormSubmit={accept}>
		<Field.Root name="qty">
			<NumberField.Root required>
				<NumberField.Input data-testid="control" />
			</NumberField.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{/if}
