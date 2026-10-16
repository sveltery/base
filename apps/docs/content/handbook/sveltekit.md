---
title: SvelteKit
description: Notes on server rendering, form actions, and remote form functions when you use Sveltery Base in a SvelteKit app.
order: 7
---

Sveltery Base does not depend on SvelteKit. The components import nothing from `@sveltejs/kit` or `$app/*`, so they work in any Svelte 5 app. This page covers what changes when the app is a SvelteKit app: server rendering, form actions, remote form functions, and prerendering.

## Server rendering and hydration

Every part renders on the server, with its ARIA attributes and data attributes. Before the page hydrates, labels and native form submission already work. Interactive parts, such as triggers and sliders, respond once the page hydrates.

### Ids

Parts that need an id, such as `Field.Control` and `Field.Label`, generate one with Svelte's `$props.id()`. The server and the client generate the same ids, such as `base-ui-s3`, so the `for`, `aria-labelledby`, and `aria-describedby` references in the server HTML stay valid after hydration. An `id` you pass to a part replaces the generated one.

### Popups

Dialog and Popover render their popups in a portal, and a portal renders nothing on the server. A popup that is open on the first render appears when the page hydrates. Until then, its trigger has no `aria-controls`, and a Popover trigger has `aria-expanded="false"`.

### Form validation

Form turns off the browser's validation bubbles with `novalidate`, but only after it hydrates. The server HTML has no `novalidate` attribute, so before hydration, or with JavaScript off, the browser checks `required`, `type`, and the other constraints itself. A submit button with `formnovalidate` skips validation, as it does in HTML.

## Bind a SvelteKit remote form

Pass a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form) to the `form` prop of Form. Pass each of its fields to the `field` prop of a `Field.Root`. The remote form then owns the values and the issues. Field shows them, and Form sends the submit through the remote form. You do not add `use:enhance`, set `name` on the controls, or pass `errors`.

Remote functions are experimental in SvelteKit. Turn them on with `experimental: { remoteFunctions: true }` in the `sveltekit()` options in `vite.config.ts`.

Put the schema in its own module, so that the server and the page can both import it. Any [Standard Schema](https://standardschema.dev) library works. These examples use Valibot.

```ts title="src/routes/signup/schema.ts"
import * as v from 'valibot';

export const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Enter a valid email')),
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters')),
	age: v.pipe(v.number('Enter your age'), v.minValue(18, 'You must be 18 or older'))
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

On the page, `preflight` runs the same schema in the browser before each submit:

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
	<Field.Root field={f.fields.email} type="email">
		<Field.Label>Email</Field.Label>
		<Field.Control required />
		<Field.Error />
	</Field.Root>
	<Field.Root field={f.fields.name}>
		<Field.Label>Name</Field.Label>
		<Field.Control />
		<Field.Error />
	</Field.Root>
	<Field.Root field={f.fields.age} type="number">
		<Field.Label>Age</Field.Label>
		<Field.Control />
		<Field.Error />
	</Field.Root>
	<button disabled={f.pending > 0}>Sign up</button>
	{#if f.result}
		<p>Welcome, {f.result.welcome}</p>
	{/if}
</Form>
```

`Field.Control` takes its name and value from the field. The name carries SvelteKit's encoding, such as `n:age` for a number, so do not set `name` or `value` on the control. The field's issues show in `Field.Error`, and the field's `touched` and `dirty` state sets `data-touched` and `data-dirty`. `Form.Error` shows the issues on the whole form, such as `invalid('Signups are closed')`, and any issue on a path that no field binds.

A submit runs these checks in order:

1. The native constraints, such as `required` and `type="email"`. A failed constraint blocks the request and focuses the field. The preflight schema still runs, so its issues show too.
2. The preflight schema. Its issues show in the fields, and Form focuses the first one. No request is sent.
3. The handler on the server. An issue from `invalid` shows in its field, and Form focuses that field.

When the handler returns, `f.result` holds its return value and the form resets. To keep the values or do something else after the submit, pass [`enhance`](#customize-the-submit).

A server issue does not block the next submit, because only the server can clear it. It hides as soon as the user changes the field. After the first submit, each change validates the field again against the schema, with no request. Set `validationMode="onBlur"` or `validationMode="onChange"` on Form to show schema issues before the first submit.

### Type the control

The `type` on `Field.Root` is the input type of its control. TypeScript checks it against the type of the field's value:

| Value      | Allowed `type`                                                                                           | Required               |
| ---------- | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| `string`   | `text`, `email`, `password`, `url`, `tel`, `search`, the date and time types, `color`, `radio`, `select` | no, defaults to `text` |
| `number`   | `number`, `range`                                                                                        | yes                    |
| `boolean`  | `checkbox`, `switch`                                                                                     | yes                    |
| `string[]` | `checkbox`, `select multiple`                                                                            | yes                    |

So `<Field.Root field={f.fields.age}>` fails the type check, because `age` is a number. `<Field.Root field={f.fields.age} type="email">` fails too.

### Bind a field by name

Inside a Form with a `form` source, `<Field.Root name="email">` binds to `f.fields.email`. A path such as `items[0].name` works too. TypeScript does not check the name, and `type` accepts every input type. In development, Form warns when an issue has no field to show it while a field resolved its name through the form, because a misspelled `name` submits under the wrong key. Prefer `field`, which TypeScript checks.

### Bind composite controls

Checkbox, Switch, Radio Group, Checkbox Group, Number Field, Slider, and OTP Field bind through the `Field.Root` around them. Each one renders a native input with the source's name and value, so the source reads it like a plain input. Give `Field.Root` the `type` that the control submits as:

| Control        | `type`     | Value                               |
| -------------- | ---------- | ----------------------------------- |
| Checkbox       | `checkbox` | `boolean`                           |
| Switch         | `switch`   | `boolean`                           |
| Radio Group    | `radio`    | `string`                            |
| Checkbox Group | `checkbox` | `string[]`                          |
| Number Field   | `number`   | `number`                            |
| Slider         | `range`    | `number`, with one thumb            |
| OTP Field      | `text`     | `string`, so `type` can be left out |

```svelte
<Form form={f}>
	<Field.Root field={f.fields.plan} type="radio">
		<Fieldset.Root>
			<Fieldset.Legend>Plan</Fieldset.Legend>
			<RadioGroup defaultValue="free">
				<Radio.Root value="free">Free</Radio.Root>
				<Radio.Root value="pro">Pro</Radio.Root>
			</RadioGroup>
		</Fieldset.Root>
		<Field.Error />
	</Field.Root>

	<Field.Root field={f.fields.seats} type="number">
		<Field.Label>Seats</Field.Label>
		<NumberField.Root defaultValue={1} min={0}>
			<NumberField.Group>
				<NumberField.Decrement />
				<NumberField.Input />
				<NumberField.Increment />
			</NumberField.Group>
		</NumberField.Root>
		<Field.Error />
	</Field.Root>

	<Field.Root field={f.fields.agree} type="checkbox">
		<Field.Label><Checkbox.Root /> I accept the terms</Field.Label>
		<Field.Error />
	</Field.Root>

	<Field.Root field={f.fields.newsletter} type="switch">
		<Field.Label><Switch.Root /> Send me the newsletter</Field.Label>
	</Field.Root>
</Form>
```

The control starts from the source's value when the source has one, and from `defaultValue` when it does not. A form reset returns the control to `defaultValue` and hides the source's issues. When your code calls `set()` on the field, the control shows the new value, with no `onValueChange` call. In development, a control whose kind does not match the `type` on its `Field.Root` logs an error that names both.

A checkbox sends nothing when it is unchecked, so every boolean in the schema must be optional, such as `v.optional(v.boolean(), false)`. SvelteKit rejects a remote form schema with a required boolean at the type level.

### Customize the submit

Without `enhance`, a source submit sends the request and resets the form when it succeeds. Pass a callback to `enhance` on Form to replace that step. It runs once the submit passes the native constraints and the preflight schema. Nothing is sent until it calls `submit()`, which resolves to `true` when the submit succeeds:

```svelte
<Form
	form={f}
	enhance={async ({ submit }) => {
		if (await submit()) toast('Welcome aboard');
	}}
>
	…
</Form>
```

This callback keeps the values after a successful submit. To reset the form yourself, call `reset()` on the instance's `element`. The instance is the source's own, so with a remote form it has SvelteKit's `submit().updates(...)`.

Pass the callback to Form, not to the source's `enhance()` method. Form installs its own callback on the source, so that it can tell issues from the server apart from issues from the schema, and it calls yours from there. Do not combine `form` with `onFormSubmit`. In development, Form warns when you do.

### Work without JavaScript

A form bound to a remote form works before the page hydrates and with JavaScript off:

- The server renders no `novalidate`, so the browser checks `required`, `type`, and the other constraints, and an empty required field never reaches the server.
- The form posts to the server, and the page renders again with the issues in each `Field.Error` and the whole-form issues in `Form.Error`.
- Each field shows the value the user submitted.
- After a success, `f.result` holds the return value.

Once the page hydrates, Form sets `novalidate` and shows every message in `Field.Error`.

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

On the page, pass `form?.errors` to `errors`, and each submitted value to the control's `defaultValue`. `use:enhance` is an action, so `fromAction` turns it into an attachment on Form. Its submit function cancels a submit that Form blocked:

```svelte title="src/routes/signup/+page.svelte"
<script lang="ts">
	import { enhance } from '$app/forms';
	import { fromAction } from 'svelte/attachments';
	import { Field } from '@sveltery/base/field';
	import { Form, isSubmitBlocked } from '@sveltery/base/form';

	let { form } = $props();
</script>

<Form
	method="POST"
	errors={form?.errors}
	{@attach fromAction(enhance, () => ({ formElement, cancel }) => {
		if (isSubmitBlocked(formElement)) cancel();
	})}
>
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

Form validates each field before `use:enhance` sees the submit. When a field is invalid, Form calls `preventDefault()` and focuses the field. `use:enhance` does not check `defaultPrevented`, so without `cancel()` it posts the invalid values. `isSubmitBlocked(formElement)` returns `true` when Form blocked the current submit. Call it before any `await` in the submit function, because the next submit replaces the answer. A server error shows in its `Field.Error`, Form focuses the field, and the error clears as soon as the user changes the field. With JavaScript off, the browser validates, the form posts, and the page renders the errors and the submitted values.

## Prerendering

Pages that use Sveltery Base prerender like any other page. The prerendered HTML is the server-rendered HTML described above, and the parts hydrate on load.

## Without SvelteKit

Nothing in the library imports SvelteKit or `$app/*`. Lint rules in the repository keep it that way. Form, Field, and every other component work the same in a Svelte app built with Vite alone. Use `onFormSubmit` or `onsubmit` to send the values yourself, and pass the errors you get back to `errors`.
