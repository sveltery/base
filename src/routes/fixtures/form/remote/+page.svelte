<!--
	Scenario 1: a remote form on Base's Form. Each Field.Root takes the path its issues sit at.
	Name spreads Kit's props; Email lets Field.Control bind itself to `email`.
-->
<script lang="ts">
	import { Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { signup } from '../shared/forms.remote.js';
	import { signupSchema } from '../shared/schemas.js';

	const f = signup.preflight(signupSchema);
</script>

<FixturePage debug={{ result: f.result ?? null }}>
	<Form form={f}>
		<Form.Error data-testid="form-error" />
		<Field.Root name="name" data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control {...f.fields.name.as('text')} required autocomplete="off" />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name="email" data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" required autocomplete="off" />
			<Field.Description>Try taken@example.com to see an issue from the server.</Field.Description>
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit" disabled={f.pending > 0}>Sign up</button>
		{#if f.result}<p data-testid="welcome">Welcome, {f.result.welcome}.</p>{/if}
	</Form>
</FixturePage>
