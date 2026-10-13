<!-- Field.Control's `render` snippet swaps the element and keeps the bound props. -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import FixturePage from '../shared/FixturePage.svelte';
	import { signup } from '../shared/forms.remote.js';
	import { signupSchema } from '../shared/schemas.js';

	const f = signup.preflight(signupSchema);
</script>

<FixturePage
	debug={{ result: f.result ?? null, input: f.fields.value(), issues: f.fields.allIssues() ?? [] }}
>
	<Form form={f}>
		<Field.Root field={f.fields.email} type="email" data-field="email">
			<Field.Label>Email</Field.Label>
			<Field.Control required>
				{#snippet render(props)}
					<span class="input-wrapper" data-testid="wrapper"><input {...props} /></span>
				{/snippet}
			</Field.Control>
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root field={f.fields.name} data-field="name">
			<Field.Label>Name</Field.Label>
			<Field.Control defaultValue="Ada">
				{#snippet render(props)}
					<textarea {...props}></textarea>
				{/snippet}
			</Field.Control>
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root field={f.fields.age} type="number" data-field="age">
			<Field.Label>Age</Field.Label>
			<Field.Control />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button>Sign up</button>
		<button type="reset">Reset</button>
		{#if f.result}<p data-testid="welcome">Welcome, {f.result.welcome}</p>{/if}
	</Form>
</FixturePage>
