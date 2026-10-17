<!-- Server issues passed per field, not through Form `errors`. `?v=` picks the variant:
match (Field.Root `invalid` + Field.Error `match`), revalidate (match + Kit's `validate()` on
input), preflight (match on a preflighted form), validate (Field.Root `validate`). -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import { signup } from '../../../form/shared/forms.remote.js';
	import { signupSchema } from '../../../form/shared/schemas.js';

	const v = page.url.searchParams.get('v') ?? 'match';
	const f = v === 'preflight' ? signup.preflight(signupSchema) : signup;
	const fields = [
		{ label: 'Name', type: 'text', field: f.fields.name, as: f.fields.name.as('text') },
		{ label: 'Email', type: 'email', field: f.fields.email, as: f.fields.email.as('email') }
	] as const;
</script>

<FixturePage debug={f.result ?? null}>
	<Form {...f} oninput={v === 'revalidate' ? () => f.validate() : undefined}>
		{#each fields as { label, type, field, as } (label)}
			<Field.Root
				name={as.name}
				data-field={label.toLowerCase()}
				invalid={v === 'validate' ? undefined : !!field.issues()}
				validate={v === 'validate'
					? () => field.issues()?.map((issue) => issue.message) ?? null
					: undefined}
			>
				<Field.Label>{label}</Field.Label>
				<Field.Control {type} defaultValue={field.value()} />
				{#if v === 'validate'}
					<Field.Error data-testid="error" />
				{:else}
					<Field.Error data-testid="error" match={!!field.issues()}>
						{#each field.issues() ?? [] as issue (issue.message)}{issue.message}{/each}
					</Field.Error>
				{/if}
			</Field.Root>
		{/each}
		<button type="submit" disabled={f.pending > 0}>Sign up</button>
		{#if f.result}<p data-testid="welcome">Welcome, {f.result.welcome}.</p>{/if}
	</Form>
</FixturePage>
