<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Field, Form } from '#lib';
	import { tanstackField } from '../lib/form/tanstack/index.js';

	const form = createForm(() => ({
		defaultValues: {
			email: 'ada@example.com',
			age: 36,
			agree: false,
			tags: ['svelte'] as string[]
		}
	}));
	const values = form.useSelector((state) => state.values);
</script>

<Form data-testid="form">
	<form.Field
		name="email"
		validators={{ onChange: ({ value }) => (value.includes('@') ? undefined : 'Enter an email') }}
	>
		{#snippet children(field)}
			{@const handle = tanstackField(field)}
			<Field.Root field={handle} type="email">
				<Field.Label>Email</Field.Label>
				<Field.Control data-testid="email" />
				<Field.Error data-testid="email-error" />
			</Field.Root>
			<output data-testid="email-meta">
				{JSON.stringify({
					touched: handle.touched(),
					dirty: handle.dirty(),
					issues: handle.issues() ?? []
				})}
			</output>
		{/snippet}
	</form.Field>
	<form.Field name="age">
		{#snippet children(field)}
			<Field.Root field={tanstackField(field)} type="number">
				<Field.Label>Age</Field.Label>
				<Field.Control data-testid="age" />
			</Field.Root>
		{/snippet}
	</form.Field>
	<form.Field name="agree">
		{#snippet children(field)}
			<label><input {...tanstackField(field).as('checkbox')} data-testid="agree" /> Agree</label>
		{/snippet}
	</form.Field>
	<form.Field name="tags">
		{#snippet children(field)}
			{@const handle = tanstackField(field)}
			<label><input {...handle.as('checkbox', 'svelte')} data-testid="svelte" /> Svelte</label>
			<label><input {...handle.as('checkbox', 'kit')} data-testid="kit" /> Kit</label>
		{/snippet}
	</form.Field>
	<button type="reset">Reset</button>
</Form>
<pre data-testid="values">{JSON.stringify(values.current)}</pre>
