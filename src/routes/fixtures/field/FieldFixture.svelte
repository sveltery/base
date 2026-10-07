<script lang="ts">
	import { Field, Form } from '#lib';
	import type { FieldCase } from './cases.js';

	let { scenario }: { scenario: FieldCase } = $props();

	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		details.event.preventDefault();
		submitted += 1;
		values = JSON.stringify(formValues);
	}
</script>

{#if scenario === 'labelled'}
	<Field.Root data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'described'}
	<Field.Root>
		<Field.Control data-testid="control" aria-describedby="author" />
		<Field.Description data-testid="description">Help</Field.Description>
	</Field.Root>
{:else if scenario === 'required'}
	<Form onFormSubmit={accept}>
		<Field.Root>
			<Field.Control required data-testid="control" />
			<Field.Error data-testid="error">Required</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'disabled'}
	<Field.Root disabled data-testid="field">
		<Field.Label>Email</Field.Label>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'invalid'}
	<Field.Root invalid data-testid="field">
		<Field.Control data-testid="control" />
	</Field.Root>
{:else}
	<Form onFormSubmit={accept}>
		<Field.Root name="username">
			<Field.Control defaultValue="ada" data-testid="control" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="values">{values}</output>
{/if}
