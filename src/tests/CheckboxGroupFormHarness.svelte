<script lang="ts">
	import { Checkbox, CheckboxGroup, Field, Form } from '#lib';

	let values = $state('');
	let validated = $state('');
	let formData = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		values = JSON.stringify(formValues);
		const form = details.event.currentTarget;
		if (form instanceof HTMLFormElement) formData = JSON.stringify([...new FormData(form)]);
	}
</script>

<Form onFormSubmit={accept}>
	<Field.Root
		name="colors"
		validate={(value, formValues) => {
			validated = `${JSON.stringify(value)} ${JSON.stringify(formValues)}`;
			return null;
		}}
	>
		<CheckboxGroup data-testid="group" defaultValue={['red', 'green', 'blue']}>
			<Checkbox.Root value="red" />
			<Checkbox.Root value="green" disabled />
			<Checkbox.Root value="blue" form="elsewhere" data-testid="blue" />
		</CheckboxGroup>
	</Field.Root>
	<button type="submit">Submit</button>
</Form>
<form id="elsewhere"></form>
<output data-testid="values">{values}</output>
<output data-testid="validated">{validated}</output>
<output data-testid="form-data">{formData}</output>
