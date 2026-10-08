<script lang="ts">
	import { Field } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';
	import { takeForm } from '../form-log.js';
	import type { FieldCase } from './cases.js';
	import FieldHelpCases from './FieldHelpCases.svelte';

	let { scenario }: { scenario: FieldCase } = $props();

	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#if scenario === 'labelled'}
	<Field.Root data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'described' || scenario === 'required'}
	<FieldHelpCases {scenario} {accept} {submitted} />
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
	<FormSubmit {accept} {values}>
		<Field.Root name="username">
			<Field.Control defaultValue="ada" data-testid="control" />
		</Field.Root>
	</FormSubmit>
{/if}
