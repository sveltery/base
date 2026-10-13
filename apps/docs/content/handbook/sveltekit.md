---
title: SvelteKit
description: Notes on server rendering, form actions, and remote form functions when you use Sveltery Base in a SvelteKit app.
order: 5
---

Sveltery Base does not depend on SvelteKit. The components import nothing from `@sveltejs/kit` or `$app/*`, so they work in any Svelte 5 app. This page covers what changes when the app is a SvelteKit app: server rendering, form actions, remote form functions, and prerendering.

## Server rendering and hydration

Every part renders on the server, with its ARIA attributes and data attributes. Before the page hydrates, labels and native form submission already work. Interactive parts, such as triggers and sliders, respond once the page hydrates.

### Ids

Parts that need an id, such as `Field.Control` and `Field.Label`, generate one with Svelte's `$props.id()`. The server and the client generate the same ids, such as `base-ui-s3`, so the `for`, `aria-labelledby`, and `aria-describedby` references in the server HTML stay valid after hydration. An `id` you pass to a part replaces the generated one.

### Popups

Dialog and Popover render their popups in a portal, and a portal renders nothing on the server. A popup that is open on the first render appears when the page hydrates. Until then, its trigger has no `aria-controls`, and a Popover trigger has `aria-expanded="false"`.

### Form validation

Form turns off the browser's validation bubbles with `novalidate`, but only after it hydrates. The server HTML has no `novalidate` attribute, so before hydration, or with JavaScript off, the browser checks `required`, `type`, and the other constraints itself.

## Form actions

Form renders a native `<form>`, so it posts to a [form action](https://svelte.dev/docs/kit/form-actions) like any other form. Return the field errors from the action with `fail`:

```ts
// src/routes/signup/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '');
		if (await isRegistered(email)) {
			return fail(400, { email, errors: { email: 'That email is already registered.' } });
		}
		return { success: true };
	}
} satisfies Actions;
```

Pass `form.errors` to the `errors` prop of Form. To progressively enhance the form, add SvelteKit's `enhance` action. Form is a component, so it does not take `use:` directives. Convert the action into an attachment with `fromAction` from `svelte/attachments`. Form passes the attachment to its `<form>` element:

```svelte
<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { fromAction } from 'svelte/attachments';
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	let { form } = $props();
</script>

<Form method="POST" errors={form?.errors} {@attach fromAction(enhance)}>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Field.Control type="email" required value={form?.email ?? ''} />
		<Field.Error />
	</Field.Root>
	<button>Sign up</button>
</Form>
```

To pass a callback to `enhance`, give it as the second argument: `fromAction(enhance, () => callback)`.

With this setup:

- An invalid field stops the submit before `enhance` sends the request. Form validates in a capture-phase `submit` listener, so `enhance` never sees an invalid submit.
- The server error shows in `Field.Error`, and Form focuses the field.
- The error clears as soon as the user changes the field.
- With JavaScript off, the browser validates, the form posts, and the page renders the server error and the submitted value.

`value={form?.email ?? ''}` puts the submitted value back into the field after a post without JavaScript.

## Remote form functions

SvelteKit's [remote form functions](https://svelte.dev/docs/kit/remote-functions#form) work with Form and Field. Remote functions are experimental in SvelteKit. Turn them on with `experimental.remoteFunctions` in the SvelteKit options, and turn on Svelte's `experimental.async` compiler option.

```ts
// src/routes/signup/signup.remote.ts
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';

export const signup = form('unchecked', async (data: { email: string }, issue) => {
	if (await isRegistered(data.email)) invalid(issue.email('That email is already registered.'));
	return { welcome: data.email };
});
```

Spread the remote form onto Form, and spread each field's `as(...)` props onto its control:

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { signup } from './signup.remote';

	const { 'aria-invalid': _, ...email } = $derived(signup.fields.email.as('email'));
	const errors = $derived({
		[email.name]: signup.fields.email.issues()?.map((issue) => issue.message) ?? []
	});
</script>

<Form {...signup} {errors}>
	<Field.Root>
		<Field.Label>Email</Field.Label>
		<Field.Control {...email} required />
		<Field.Error />
	</Field.Root>
	<button>Sign up</button>
</Form>

{#if signup.result}
	<p>Welcome, {signup.result.welcome}</p>
{/if}
```

The `as(...)` props carry the input name that SvelteKit encodes for the remote form, such as `email/1bz8tub/signup`. Keep these points in mind:

- Do not set `name` on `Field.Root`. It would replace the encoded name, and SvelteKit would reject the submit.
- Key `errors` by the encoded name, `email.name`, because that is the name the field registers with Form.
- Leave out the `aria-invalid` from `as(...)`. Field sets `aria-invalid` from its own state, and SvelteKit's value stays `true` after Field clears the error.

Form's own validation still runs first, so an empty required field never reaches the server.

## Prerendering

Pages that use Sveltery Base prerender like any other page. The prerendered HTML is the server-rendered HTML described above, and the parts hydrate on load.

## Without SvelteKit

`src/lib` imports neither SvelteKit nor `$app/*`. Lint rules in the repository keep it that way. Form, Field, and every other component work the same in a Svelte app built with Vite alone. Use `onFormSubmit` or `onsubmit` to send the values yourself, and pass the errors you get back to `errors`.
