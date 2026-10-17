<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';
	import styles from './index.module.css';

	let errors = $state<FormErrors>({});
	let loading = $state(false);

	async function submitForm(value: string) {
		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		try {
			const url = new URL(value);

			if (url.hostname.endsWith('example.com')) {
				return { error: 'The example domain is not allowed' };
			}
		} catch {
			return { error: 'This is not a valid URL' };
		}

		return { success: true };
	}
</script>

<Form
	class={styles.Form}
	bind:errors
	onsubmit={async (event) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const value = formData.get('url') as string;

		loading = true;
		const response = await submitForm(value);
		const serverErrors: FormErrors = response.error ? { url: response.error } : {};

		errors = serverErrors;
		loading = false;
	}}
>
	<Field.Root name="url" class={styles.Field}>
		<Field.Label class={styles.Label}>Homepage</Field.Label>
		<Field.Control
			type="url"
			required
			defaultValue="https://example.com"
			placeholder="https://example.com"
			pattern="https?://.*"
			class={styles.Input}
		/>
		<Field.Error class={styles.Error} />
	</Field.Root>
	<Button disabled={loading} focusableWhenDisabled type="submit" class={styles.Button}>
		Submit
	</Button>
</Form>
