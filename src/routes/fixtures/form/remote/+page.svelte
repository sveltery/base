<!-- Scenario 1: a remote form on Base's Form, its issues passed once as `errors`, as the SvelteKit handbook shows. -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { signup } from '../shared/forms.remote.js';
	import { signupSchema } from '../shared/schemas.js';

	const f = signup.preflight(signupSchema);

	// Kit names each input itself (`email/<form id>`), so the inputs take Kit's props, and the
	// issues go to Base UI's `errors` under those names.
	const inputs = {
		name: f.fields.name.as('text'),
		email: f.fields.email.as('email')
	};

	function errorsByName(issues: { path: (string | number)[]; message: string }[] = []) {
		const errors: Record<string, string[]> = {};
		for (const issue of issues) {
			const input = inputs[issue.path.join('.') as keyof typeof inputs];
			if (input) (errors[input.name] ??= []).push(issue.message);
		}
		return errors;
	}
</script>

<FixturePage debug={{ result: f.result ?? null }}>
	<Form {...f} errors={errorsByName(f.fields.allIssues())}>
		<Field.Root data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control {...inputs.name} required autocomplete="off" />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control {...inputs.email} required autocomplete="off" />
			<Field.Description>Try taken@example.com to see an issue from the server.</Field.Description>
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit" disabled={f.pending > 0}>Sign up</button>
		{#if f.result}<p data-testid="welcome">Welcome, {f.result.welcome}.</p>{/if}
	</Form>
</FixturePage>
