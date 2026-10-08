<script lang="ts">
	import { Field } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';

	let {
		scenario,
		accept,
		submitted
	}: {
		scenario: string;
		accept: (formValues: Record<string, unknown>, details: { event: Event }) => void;
		submitted: number;
	} = $props();
</script>

{#if scenario === 'described' || scenario === 'description'}
	<Field.Root>
		<Field.Control data-testid="control" aria-describedby="author" />
		<Field.Description data-testid="description">Help</Field.Description>
	</Field.Root>
{:else}
	<FormSubmit {accept} {submitted}>
		<Field.Root>
			<Field.Control required data-testid="control" />
			<Field.Error data-testid="error">Required</Field.Error>
		</Field.Root>
	</FormSubmit>
{/if}
