<script lang="ts">
	import { Field, Input } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';
	import { takeForm } from '../form-log.js';
	import type { InputCase } from './cases.js';

	let { scenario }: { scenario: InputCase } = $props();

	let value = $state('a');
	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#if scenario === 'plain'}
	<Field.Root>
		<Input id="tested-input" placeholder="Name" data-testid="control" />
	</Field.Root>
{:else if scenario === 'labelled'}
	<Field.Root data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Input data-testid="control" />
	</Field.Root>
{:else if scenario === 'bound'}
	<Field.Root>
		<Input bind:value data-testid="control" />
	</Field.Root>
	<output data-testid="value">{value}</output>
{:else if scenario === 'disabled'}
	<Field.Root disabled data-testid="field">
		<Field.Label>Email</Field.Label>
		<Input data-testid="control" />
	</Field.Root>
{:else if scenario === 'invalid'}
	<Field.Root invalid data-testid="field">
		<Input data-testid="control" />
	</Field.Root>
{:else if scenario === 'required'}
	<FormSubmit {accept} {submitted}>
		<Field.Root>
			<Input required data-testid="control" />
			<Field.Error data-testid="error">Required</Field.Error>
		</Field.Root>
	</FormSubmit>
{:else}
	<FormSubmit {accept} {values}>
		<Field.Root name="username">
			<Input defaultValue="ada" data-testid="control" />
		</Field.Root>
	</FormSubmit>
{/if}
