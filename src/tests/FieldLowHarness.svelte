<script lang="ts">
	import { Field, Form } from '#lib';
	import { takeForm } from '../routes/fixtures/form-log.js';
	import FieldReleaseProbe from './FieldReleaseProbe.svelte';
	import InertFieldProbe from './InertFieldProbe.svelte';

	let { scenario = 'inert' }: { scenario?: 'inert' | 'release' | 'rename' | 'initial' } = $props();

	let show = $state(true);
	let seen = $state(-1);
	let controlName = $state('a');
	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#if scenario === 'inert'}
	<InertFieldProbe />
	<Field.Control data-testid="control" />
{:else if scenario === 'rename'}
	<Form onFormSubmit={accept}>
		<Field.Root>
			<Field.Control name={controlName} defaultValue="x" data-testid="control" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<button type="button" onclick={() => (controlName = 'b')}>Rename</button>
	<output data-testid="values">{values}</output>
{:else if scenario === 'initial'}
	<Form onFormSubmit={accept}>
		<Field.Root name="letter">
			<Field.Control defaultValue="x" data-testid="control" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="values">{values}</output>
{:else}
	<button type="button" onclick={() => (show = false)}>Hide</button>
	<output data-testid="seen">{seen}</output>
	<Form>
		{#if show}
			<FieldReleaseProbe bind:seen />
		{/if}
	</Form>
{/if}
