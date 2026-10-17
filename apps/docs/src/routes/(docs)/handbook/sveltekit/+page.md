# SvelteKit

<Subtitle>
  Notes on server rendering, form actions, and remote form functions when you use Sveltery Base in a SvelteKit app.
</Subtitle>

<Meta name="description" content="Notes on server rendering, form actions, and remote form functions when you use Sveltery Base in a SvelteKit app." />

Sveltery Base does not depend on SvelteKit. The components import nothing from `@sveltejs/kit` or `$app/*`, so they work in any Svelte 5 app. This page covers what changes when the app is a SvelteKit app: server rendering, form actions, remote form functions, and prerendering.

## Server rendering and hydration

Every part renders on the server, with its ARIA attributes and data attributes. Before the page hydrates, labels and native form submission already work. Interactive parts, such as triggers and sliders, respond once the page hydrates.

### Ids

Parts that need an id, such as `Field.Control` and `Field.Label`, generate one with Svelte's `$props.id()`. The server and the client generate the same ids, such as `base-ui-s3`, so the `for`, `aria-labelledby`, and `aria-describedby` references in the server HTML stay valid after hydration. An `id` you pass to a part replaces the generated one.

### Popups

Dialog and Popover render their popups in a portal, and a portal renders nothing on the server. A popup that is open on the first render appears when the page hydrates. Until then, its trigger has no `aria-controls`, and a Popover trigger has `aria-expanded="false"`.

### Form validation

Form renders `novalidate` on the server, as Base UI does. Before the page hydrates, or with JavaScript off, the browser does not check `required`, `type`, or the other constraints, and Form does not validate either. The form posts unchecked, so validate on the server. To keep the browser's checks, pass `novalidate={false}` to Form. The browser then checks the constraints after hydration too, and blocks an invalid submit before Form sees it.

## Use a SvelteKit remote form

Spread a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form) onto Form, and pass its issues to Form's `errors` prop once. Each field finds its issues through context, so `Field.Error` needs no wiring per field.

Remote functions are experimental in SvelteKit. Turn them on with `experimental: { remoteFunctions: true }` in the `sveltekit()` options in `vite.config.ts`.

Put the schema in its own module, so that the server and the page can both import it. Any [Standard Schema](https://standardschema.dev) library works. These examples use Valibot.

```ts title="src/routes/signup/schema.ts"
import * as v from 'valibot';

export const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Enter a valid email')),
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters'))
});
```

Create the remote form with `form(schema, handler)`. Call `invalid` with an issue on a field, or with a message for the whole form:

```ts title="src/routes/signup/signup.remote.ts"
import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { signupSchema } from './schema.js';

export const signup = form(signupSchema, async (data, issue) => {
	if (await isRegistered(data.email)) invalid(issue.email('Email already taken'));
	if (signupsClosed()) invalid('Signups are closed');
	return { welcome: data.name };
});
```

On the page, spread the remote form onto Form, and each field's `as()` props onto its `Field.Control`. Convert the issues to `errors` once, keyed by each input's name:

```svelte title="src/routes/signup/+page.svelte"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { signupSchema } from './schema.js';
	import { signup } from './signup.remote.js';

	const f = signup.preflight(signupSchema);

	const inputs = {
		name: f.fields.name.as('text'),
		email: f.fields.email.as('email')
	};

	// SvelteKit keys an issue by its path. Form keys `errors` by the input's name.
	function errorsByName(issues: { path: (string | number)[]; message: string }[] = []) {
		const errors: Record<string, string[]> = {};
		for (const issue of issues) {
			const input = inputs[issue.path.join('.') as keyof typeof inputs];
			if (input) (errors[input.name] ??= []).push(issue.message);
		}
		return errors;
	}
</script>

<Form {...f} errors={errorsByName(f.fields.allIssues())}>
	<Field.Root>
		<Field.Label>Name</Field.Label>
		<Field.Control {...inputs.name} required />
		<Field.Error />
	</Field.Root>
	<Field.Root>
		<Field.Label>Email</Field.Label>
		<Field.Control {...inputs.email} required />
		<Field.Error />
	</Field.Root>
	{#each f.fields.issues() ?? [] as issue (issue.message)}
		<p>{issue.message}</p>
	{/each}
	<button type="submit" disabled={f.pending > 0}>Sign up</button>
	{#if f.result}
		<p>Welcome, {f.result.welcome}</p>
	{/if}
</Form>
```

`{...f}` gives Form the `method`, the `action` and SvelteKit's submit handler. Leave `name` off `Field.Root`, because a `Field.Root` name replaces the name that `as()` gives the control. Each field shows its issues in `Field.Error` and sets `data-invalid` and `aria-invalid`. An edit clears the field's issue. The native constraints, such as `required`, run through Form's own validation. `f.fields.issues()` holds the issues on the whole form, such as `invalid('Signups are closed')`. After a successful submit, `f.result` holds the handler's return value and SvelteKit resets the form.

`errorsByName` matches an issue to an input by its path joined with dots. List a nested field in `inputs` under that key, such as `'address.city'`.

This example uses `Field.Control` for every field. Composite controls such as Checkbox and Number Field render their own native input, and this page does not cover wiring them to a remote form yet.

This setup has two limits:

1. SvelteKit sends a submit that Form blocked. Form blocks an invalid submit with `preventDefault()` only, as Base UI does, and SvelteKit's submit handler does not check `defaultPrevented`. `preflight` stops the submit only when the schema has the same rules as the controls, so put every rule in the schema.
2. Without JavaScript, the form posts unchecked, because Form renders `novalidate`. The server's schema is the only check.

## Connect a form action

A classic [form action](https://svelte.dev/docs/kit/form-actions) validates the request on the server and returns its errors. Form shows them through the `errors` prop, as in [Server-side validation](/handbook/forms#server-side-validation). Name each field with `name` on `Field.Root`, so the errors and the submitted values use the same keys.

In the action, read the form data and validate it with your schema. Return `fail()` with the first message for each field, keyed by field name, and with the submitted values, so that the page can show them again:

```ts title="src/routes/signup/+page.server.ts"
import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import { signupSchema } from './schema.js';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const values = { email: String(data.get('email') ?? ''), name: String(data.get('name') ?? '') };
		const result = v.safeParse(signupSchema, values);
		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.issues) {
				const key = v.getDotPath(issue);
				if (key) errors[key] ??= issue.message;
			}
			return fail(400, { values, errors });
		}
		if (await isRegistered(result.output.email)) {
			return fail(400, { values, errors: { email: 'Email already taken' } });
		}
		return { welcome: result.output.name };
	}
};
```

On the page, pass `form?.errors` to `errors`, and each submitted value to the control's `defaultValue`. The form posts natively:

```svelte title="src/routes/signup/+page.svelte"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	let { form } = $props();
</script>

<Form method="POST" errors={form?.errors}>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Field.Control type="email" required defaultValue={form?.values?.email} />
		<Field.Error />
	</Field.Root>
	<Field.Root name="name">
		<Field.Label>Name</Field.Label>
		<Field.Control required defaultValue={form?.values?.name} />
		<Field.Error />
	</Field.Root>
	<button>Sign up</button>
	{#if form?.welcome}
		<p>Welcome, {form.welcome}</p>
	{/if}
</Form>
```

Form validates each field on submit. When a field is invalid, Form calls `preventDefault()`, so the browser does not post, and Form focuses the field. A server error shows in its `Field.Error`, and it clears as soon as the user changes the field. Do not add `use:enhance` to this form. Like a remote form, it does not check `defaultPrevented`, so it sends a submit that Form blocked.

## Prerendering

Pages that use Sveltery Base prerender like any other page. The prerendered HTML is the server-rendered HTML described above, and the parts hydrate on load.

## Without SvelteKit

Nothing in the library imports SvelteKit or `$app/*`. Lint rules in the repository keep it that way. Form, Field, and every other component work the same in a Svelte app built with Vite alone. Use `onFormSubmit` or `onsubmit` to send the values yourself, and pass the errors you get back to `errors`.
