<!-- Scenario 1: a remote form with a preflight schema. `?mode=onBlur` or `onChange` sets validationMode. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, type FormValidationMode } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { signup } from '../shared/forms.remote.js';
	import { signupSchema } from '../shared/schemas.js';

	const f = signup.preflight(signupSchema);
	const mode = (page.url.searchParams.get('mode') ?? 'onSubmit') as FormValidationMode;
</script>

<FixturePage
	debug={{
		pending: f.pending,
		submitted: f.submitted,
		result: f.result ?? null,
		input: f.fields.value(),
		issues: f.fields.allIssues() ?? []
	}}
>
	<Form form={f} validationMode={mode}>
		<Form.Error data-testid="form-error" />
		<Field.Root field={f.fields.email} type="email" data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control required />
			<Field.Description>We never share it.</Field.Description>
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root field={f.fields.name} data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root field={f.fields.age} type="number" data-field="age">
			<Field.Label>Age</Field.Label>
			<Field.Control />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button disabled={f.pending > 0}>Sign up</button>
		<button type="reset">Reset</button>
		{#if f.result}<p data-testid="welcome">Welcome, {f.result.welcome}</p>{/if}
	</Form>
</FixturePage>
