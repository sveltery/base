<!-- A remote form on Form, named Fields, spreads on Input and Textarea, and Form.Error. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Field, Form, Input, Textarea } from '#lib';

	const f = {} as RemoteForm<{ email: string; bio: string; age: number }, { ok: true }>;
	const row = f.for('row');
	const chained = f.enhance(async () => {});
</script>

<Form form={f}>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Input {...f.fields.email.as('email')} required />
		<Field.Error />
		<Field.Error match="valueMissing">Enter your email.</Field.Error>
		<Field.Error>
			{#snippet children(messages)}{messages.join(' ')}{/snippet}
		</Field.Error>
	</Field.Root>
	<Field.Root name="bio">
		<Textarea {...f.fields.bio.as('text')} rows={4} />
	</Field.Root>
	<Form.Error />
	<Form.Error match="customError" class="error">
		{#snippet children(messages)}{messages.join(' ')}{/snippet}
	</Form.Error>
</Form>

<Form form={row}><Form.Error /></Form>
<Form form={chained}></Form>
