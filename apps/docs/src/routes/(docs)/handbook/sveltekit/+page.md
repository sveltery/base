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

Form leaves the browser's constraint validation on. Before the page hydrates, and with JavaScript off, the browser checks `required`, `type`, and the other constraints and shows its own message. After hydration, the browser still blocks an invalid submit, but each Field shows the message in its `Field.Error` instead of the browser's bubble, and Form focuses the first invalid control. A sync `validate` on `Field.Root` takes part in the same check. Pass `novalidate` to Form to turn the browser's check off.

## Use a SvelteKit remote form

Pass a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form) to Form's `form` prop, and give each `Field.Root` the path of its field as `name`. Each Field reads its own issues from the remote form, so `Field.Error` needs no wiring.

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

On the page, pass the remote form to Form. A `Field.Control` in a named `Field.Root` names itself from the field. You can also spread a field's `as()` props onto the control, as the Name field does here:

```svelte title="src/routes/signup/+page.svelte"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { signupSchema } from './schema.js';
	import { signup } from './signup.remote.js';

	const f = signup.preflight(signupSchema);
</script>

<Form form={f}>
	<Form.Error />
	<Field.Root name="name">
		<Field.Label>Name</Field.Label>
		<Field.Control {...f.fields.name.as('text')} required />
		<Field.Error />
	</Field.Root>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Field.Control type="email" required />
		<Field.Error />
	</Field.Root>
	<button type="submit" disabled={f.pending > 0}>Sign up</button>
	{#if f.result}
		<p>Welcome, {f.result.welcome}</p>
	{/if}
</Form>
```

Form takes the `method`, the `action`, and SvelteKit's submit handler from the remote form. It also accepts a `for(id)` instance and the value that `enhance()` returns.

- `Field.Root name` is a path, such as `email`, `address.city`, or `members[0].email`. The Field shows the issues at that path and below it, except the paths that a nested `Field.Root` names.
- `Form.Error` shows the issues on the whole form, such as `invalid('Signups are closed')`. While it has messages, `<form>` lists its id in `aria-describedby`.
- An edit hides the field's issues until the issues change or a later submit finishes.
- Field sets `aria-invalid` on the control, in place of the one from `as()`.
- With JavaScript off, the form posts natively, and the server renders the issues in each `Field.Error` and `Form.Error`.

In development, Field warns in the console when a spread names a different field than its `Field.Root`, such as `as()` props for `email` inside `<Field.Root name="emial">`.

## Connect a form action

A classic [form action](https://svelte.dev/docs/kit/form-actions) validates the request on the server and returns its errors. Form shows them through the `errors` prop, as in [Server-side validation](/handbook/forms#server-side-validation). Name each field with `name` on `Field.Root`, so that the errors and the submitted values use the same keys.

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

On the page, pass `form?.errors` to `errors` and `form?.values` to `values`. Each control starts from the value under its name. The form posts natively:

```svelte title="src/routes/signup/+page.svelte"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	let { form } = $props();
</script>

<Form method="POST" errors={form?.errors} values={form?.values}>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Field.Control type="email" required />
		<Field.Error />
	</Field.Root>
	<Field.Root name="name">
		<Field.Label>Name</Field.Label>
		<Field.Control required />
		<Field.Error />
	</Field.Root>
	<button>Sign up</button>
	{#if form?.welcome}
		<p>Welcome, {form.welcome}</p>
	{/if}
</Form>
```

The browser blocks an invalid submit, so the form does not post, and Form focuses the first invalid control. A server error shows in its `Field.Error`, and it clears as soon as the user changes the field. An `errors['']` entry shows in `Form.Error`. Because the browser's check blocks the submit itself, `use:enhance` works on this form too.

## Prerendering

Pages that use Sveltery Base prerender like any other page. The prerendered HTML is the server-rendered HTML described above, and the parts hydrate on load.

## Without SvelteKit

Nothing in the library imports SvelteKit or `$app/*`. Lint rules in the repository keep it that way. Form, Field, and every other component work the same in a Svelte app built with Vite alone. Use `onsubmit` to send the values yourself, and pass the errors you get back to `errors`.
