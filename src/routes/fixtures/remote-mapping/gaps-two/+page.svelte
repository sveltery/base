<!-- Two fields. With Kit's preflight, a server issue the user already edited comes back on the
next blocked submit. `?v=base` validates with Base instead, and gates Kit in `enhance`. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { signup } from '../../form/shared/forms.remote.js';
	import { signupSchema } from '../../form/shared/schemas.js';

	const v = page.url.searchParams.get('v') ?? 'preflight';
	const f =
		v === 'preflight'
			? signup.preflight(signupSchema)
			: signup.enhance(async ({ element, submit }) => {
					if (element.checkValidity()) await submit();
				});
	const name = signup.fields.name.as('text');
	const email = signup.fields.email.as('email');
	const names: Record<string, string> = { name: name.name, email: email.name };

	function errorsByName() {
		const errors: Record<string, string[]> = {};
		for (const issue of signup.fields.allIssues() ?? []) {
			const key = names[issue.path.join('.')];
			if (key) (errors[key] ??= []).push(issue.message);
		}
		return errors;
	}
	const minLength = (value: unknown) =>
		v === 'base' && String(value).length < 2 ? 'Use at least 2 characters' : null;
</script>

<FixturePage debug={{ result: signup.result ?? null }}>
	<Form {...f} errors={errorsByName()}>
		<Field.Root data-field="name" name={name.name} validate={minLength}>
			<Field.Label>Name</Field.Label>
			<Field.Control />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root data-field="email" name={email.name}>
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
