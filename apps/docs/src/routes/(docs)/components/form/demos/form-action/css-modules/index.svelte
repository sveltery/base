<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';
	import styles from './index.module.css';

	let errors = $state<FormErrors>({});
	let loading = $state(false);

	async function submitForm(formValues: Record<string, unknown>) {
		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		try {
			const username = formValues.username as string | null;

			if (username === 'admin') {
				return { success: false, serverErrors: { username: "'admin' is reserved for system use" } };
			}

			const success = Math.random() > 0.5;

			if (!success) {
				return {
					serverErrors: { username: `${username} is unavailable` }
				};
			}
		} catch {
			return { serverErrors: { username: 'A server error has occurred' } };
		}

		return {};
	}
</script>

<Form
	class={styles.Form}
	bind:errors
	onsubmit={async (event) => {
		event.preventDefault();
		const formValues = Object.fromEntries(new FormData(event.currentTarget));
		loading = true;
		const result = await submitForm(formValues);
		errors = result.serverErrors ?? {};
		loading = false;
	}}
>
	<Field.Root name="username" class={styles.Field}>
		<Field.Label class={styles.Label}>Username</Field.Label>
		<Field.Control
			type="text"
			autocomplete="username"
			required
			defaultValue="admin"
			placeholder="e.g. alice132"
			class={styles.Input}
		/>
		<Field.Error class={styles.Error} />
	</Field.Root>
	<Button type="submit" disabled={loading} focusableWhenDisabled class={styles.Button}>
		Submit
	</Button>
</Form>
