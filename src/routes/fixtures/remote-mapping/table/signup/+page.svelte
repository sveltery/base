<!-- The signup form written straight from mapping-table.md, with no helper. -->
<script lang="ts">
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import { Field, Form } from '#lib';
	import { signup as f } from '../../../form/shared/forms.remote.js';

	const name = f.fields.name.as('text');
	const email = f.fields.email.as('email');
</script>

<FixturePage debug={f.result ?? null}>
	<Form
		{...f}
		errors={{
			[name.name]: f.fields.name.issues()?.map((issue) => issue.message) ?? [],
			[email.name]: f.fields.email.issues()?.map((issue) => issue.message) ?? []
		}}
	>
		<Field.Root name={name.name} data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control defaultValue={f.fields.name.value()} required />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name={email.name} data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control type="email" defaultValue={f.fields.email.value()} required />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit" disabled={f.pending > 0}>Sign up</button>
		{#if f.result}<p data-testid="welcome">Welcome, {f.result.welcome}.</p>{/if}
	</Form>
</FixturePage>
