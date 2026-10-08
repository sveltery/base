<script lang="ts">
	import { Field, NumberField } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';

	let {
		accept,
		submitted
	}: {
		accept: (formValues: Record<string, unknown>, details: { event: Event }) => void;
		submitted: number;
	} = $props();
</script>

<FormSubmit {accept} {submitted}>
	<Field.Root name="qty">
		<NumberField.Root required>
			<NumberField.Input data-testid="control" />
		</NumberField.Root>
		<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
	</Field.Root>
</FormSubmit>
