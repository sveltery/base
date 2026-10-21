<script lang="ts">
	import { Field, Fieldset, Form } from '#lib';
	import { submitTo } from '../routes/fixtures/form-log.js';

	let { scenario }: { scenario: 'static' | 'toggle' } = $props();

	let disabled = $state(scenario === 'static');
	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>) {
		submitted += 1;
		values = JSON.stringify(formValues);
	}
</script>

<Form onsubmit={submitTo(accept)}>
	<Fieldset.Root {disabled}>
		<Field.Root name="disabled">
			<Field.Control required data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Fieldset.Root>
	{#if scenario === 'static'}
		<Field.Root name="enabled">
			<Field.Control defaultValue="sent" />
		</Field.Root>
	{:else}
		<button type="button" onclick={() => (disabled = true)}>Disable</button>
		<button type="button" onclick={() => (disabled = false)}>Enable</button>
	{/if}
	<button type="submit">Submit</button>
</Form>
<output data-testid="submitted">{submitted}</output>
<output data-testid="values">{values}</output>
