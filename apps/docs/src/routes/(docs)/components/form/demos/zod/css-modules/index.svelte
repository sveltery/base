<script lang="ts">
	import { z } from 'zod';
	import { Button } from '@sveltery/base/button';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';
	import styles from './index.module.css';

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		age: z.coerce.number('Age must be a number').positive('Age must be a positive number')
	});

	async function submitForm(formValues: Record<string, unknown>) {
		const result = schema.safeParse(formValues);

		if (!result.success) {
			return {
				errors: z.flattenError(result.error).fieldErrors as FormErrors
			};
		}

		return {
			errors: {}
		};
	}

	let errors = $state<FormErrors>({});
</script>

<Form
	class={styles.Form}
	bind:errors
	onFormSubmit={async (formValues) => {
		const response = await submitForm(formValues);
		errors = response.errors;
	}}
>
	<Field.Root name="name" class={styles.Field}>
		<Field.Label class={styles.Label}>Name</Field.Label>
		<Field.Control placeholder="Enter name" class={styles.Input} />
		<Field.Error class={styles.Error} />
	</Field.Root>
	<Field.Root name="age" class={styles.Field}>
		<Field.Label class={styles.Label}>Age</Field.Label>
		<Field.Control placeholder="Enter age" class={styles.Input} />
		<Field.Error class={styles.Error} />
	</Field.Root>
	<Button type="submit" class={styles.Button}>Submit</Button>
</Form>
