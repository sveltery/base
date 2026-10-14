<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Field, Form } from '#lib';
	import { tanstackField } from '../lib/form/tanstack/index.js';

	const taken = ['admin', 'alice'];
	let submitted = $state<string[]>([]);

	const form = createForm(() => ({
		defaultValues: { username: '' },
		onSubmit: ({ value }) => {
			submitted = [...submitted, value.username];
		}
	}));
	const submission = form.useSelector((state) => ({
		attempts: state.submissionAttempts,
		submitting: state.isSubmitting
	}));
</script>

<Form
	onsubmit={(event) => {
		event.preventDefault();
		form.handleSubmit();
	}}
>
	<form.Field
		name="username"
		validators={{
			onChangeAsyncDebounceMs: 50,
			onChangeAsync: async ({ value }) => {
				await Promise.resolve();
				return taken.includes(value) ? `${value} is not available.` : undefined;
			}
		}}
	>
		{#snippet children(field)}
			<Field.Root field={tanstackField(field)} type="text">
				<Field.Label>Username</Field.Label>
				<Field.Control data-testid="username" />
				<Field.Error data-testid="error" />
			</Field.Root>
		{/snippet}
	</form.Field>
	<button type="submit">Submit</button>
</Form>
<output data-testid="submission">{JSON.stringify(submission.current)}</output>
<output data-testid="submitted">{JSON.stringify(submitted)}</output>
