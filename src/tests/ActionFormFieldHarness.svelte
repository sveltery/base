<script lang="ts">
	import { Field, Form } from '#lib';
	import { actionForm } from '../lib/form/kit/index.js';
	import { server } from './kit-forms-mock.svelte.js';
	import { signupSchema } from './signup-schema.js';

	let { mode }: { mode?: 'onSubmit' | 'onBlur' | 'onChange' } = $props();

	const f = actionForm(signupSchema, () => server.form as { welcome: string } | undefined);
</script>

<Form form={f} validationMode={mode} data-testid="form">
	<Field.Root field={f.fields.email} type="email">
		<Field.Label>Email</Field.Label>
		<Field.Control data-testid="email" />
		<Field.Error data-testid="email-error" />
	</Field.Root>
	<Field.Root field={f.fields.name}>
		<Field.Label>Name</Field.Label>
		<Field.Control data-testid="name" />
		<Field.Error data-testid="name-error" />
	</Field.Root>
	<Field.Root field={f.fields.age} type="number">
		<Field.Label>Age</Field.Label>
		<Field.Control data-testid="age" />
		<Field.Error data-testid="age-error" />
	</Field.Root>
	<Form.Error data-testid="form-error" />
	<button>Submit</button>
	<button type="reset">Reset</button>
	{#if f.result}<p data-testid="result">Welcome, {f.result.welcome}</p>{/if}
</Form>
