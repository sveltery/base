---
title: Forms
description: A guide to building forms with Sveltery Base components.
order: 4
---

The form components build on the browser's [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api). [Form](/components/form), [Field](/components/field), and [Fieldset](/components/fieldset) collect values, validate them, show errors, and focus the first invalid control. The controls work with `bind:value` and with native form submission. Form and Field also bind to an owner of form state: a SvelteKit remote form, a SvelteKit form action, or a TanStack Form field.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	let submitted = $state<Record<string, unknown> | null>(null);
</script>

<Form
	class="flex w-72 flex-col gap-4 text-gray-900 dark:text-gray-100"
	onFormSubmit={(values) => (submitted = values)}
>
	<Field.Root name="email" class="flex flex-col gap-1">
		<Field.Label class="text-sm font-medium">Email</Field.Label>
		<Field.Control
			type="email"
			required
			placeholder="alice@example.com"
			class="h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900"
		/>
		<Field.Description class="text-sm text-gray-600 dark:text-gray-400">
			We send the receipt to this address.
		</Field.Description>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<button
		class="h-9 rounded-md bg-gray-900 px-3.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 dark:bg-gray-100 dark:text-gray-900"
	>
		Submit
	</button>
	{#if submitted}
		<pre class="text-xs">{JSON.stringify(submitted)}</pre>
	{/if}
</Form>
```

## Naming form controls

Each control needs an accessible name, so that assistive technology can announce it. Use the label that fits the control.

### Input controls

Use `Field.Label` or a native `<label>` for these controls:

- [Input](/components/input) and `Field.Control`
- [Number Field](/components/number-field)
- [OTP Field](/components/otp-field)
- [Checkbox](/components/checkbox)
- [Radio Group](/components/radio-group)
- [Switch](/components/switch)

A Checkbox, Radio, or Switch inside a `Field.Label` takes its name from the label text:

```svelte
<Field.Root>
	<Field.Label>
		<Checkbox.Root />
		Accept the terms
	</Field.Label>
</Field.Root>
```

### Other controls

A [Slider](/components/slider) takes its name from `Slider.Label`. For a slider with more than one thumb, also give each `Slider.Thumb` an `aria-label` to tell the thumbs apart.

### Fallback

If you render no visible label, set `aria-label` on the control itself.

### Describe the control

`Field.Description` describes the control. The control's `aria-describedby` points at it, and at `Field.Error` while an error shows.

```svelte
<Field.Root>
	<Field.Label>Password</Field.Label>
	<Field.Control type="password" />
	<Field.Description>Use at least 8 characters.</Field.Description>
</Field.Root>
```

### Label a group of controls

When one label applies to several controls, use a Fieldset. Put the group label in `Fieldset.Legend`. For a checkbox group or a radio group, wrap each option in a `Field.Item` so that each control has its own label and description:

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';

	let storage = $state('ssd');
</script>

<Field.Root name="storage">
	<Fieldset.Root class="text-sm text-gray-900 dark:text-gray-100">
		<Fieldset.Legend class="mb-2 font-medium">Storage type</Fieldset.Legend>
		<RadioGroup bind:value={storage} class="flex flex-col gap-2">
			{#each [{ value: 'ssd', label: 'SSD' }, { value: 'hdd', label: 'HDD' }] as option (option.value)}
				<Field.Item>
					<Field.Label class="flex items-center gap-2">
						<Radio.Root
							value={option.value}
							class="flex size-5 items-center justify-center rounded-full border border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:border-gray-900 data-[checked]:bg-gray-900 dark:border-gray-600 dark:data-[checked]:border-gray-100 dark:data-[checked]:bg-gray-100"
						>
							<Radio.Indicator class="size-2 rounded-full bg-white dark:bg-gray-900" />
						</Radio.Root>
						{option.label}
					</Field.Label>
				</Field.Item>
			{/each}
		</RadioGroup>
	</Fieldset.Root>
</Field.Root>
```

A Radio Group inside a Fieldset takes its name from the legend.

## Build form fields

Give `Field.Root` a `name`. The control in the field submits its value under that name, and Form reports it under that name. The `name` on `Field.Root` takes precedence over a `name` on the control.

```svelte
<Field.Root name="email">
	<Field.Label>Email</Field.Label>
	<Field.Control type="email" />
</Field.Root>
```

When a form source owns the state, pass the source's field to `field` instead of a `name`. [Bind a SvelteKit remote form](#bind-a-sveltekit-remote-form) shows how.

### Bind values

Each control takes `bind:value` (or `bind:checked`) to share its value with your component. Without `bind:`, the control keeps its own state.

```svelte
<script lang="ts">
	let email = $state('');
</script>

<Field.Root name="email">
	<Field.Label>Email</Field.Label>
	<Field.Control type="email" bind:value={email} />
</Field.Root>
```

Form controls also take `defaultValue` or `defaultChecked`, as HTML inputs do. It is the value an empty binding starts from, and the value a form reset restores. Other components, such as Tabs and Toggle, take an initial value through the bound prop instead.

A field bound to a form source takes its value from the source, so it needs no `bind:value`. Read the value with the source field's `value()` method and change it with `set()`.

## Submit data

Form renders a native `<form>`, so a plain `action` and `method` submit the way HTML does. To handle the submit in your code, use `onsubmit` or `onFormSubmit`:

- `onsubmit` is the native submit event handler. It runs only when no field blocks the submit. Call `event.preventDefault()` to stop the browser from navigating.
- `onFormSubmit` receives the value of each named field as an object, with the event details as the second argument. Form calls `preventDefault()` on the native event for you.
- `form` takes a form source, such as a SvelteKit remote form. The source sends the submit. Do not combine it with `onFormSubmit`. In development, Form warns when you do.

```svelte
<Form
	onFormSubmit={(values) => {
		console.log(values); // { email: 'alice@example.com' }
	}}
>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Field.Control type="email" />
	</Field.Root>
	<button>Submit</button>
</Form>
```

## Constraint validation

The controls support the native validation attributes, with their HTML names:

- `required` marks a field that needs a value.
- `pattern` is a regular expression that the value must match.
- `minlength` and `maxlength` limit the length of a text value.
- `min`, `max`, and `step` limit a numeric value.

Form turns off the browser's own validation bubbles once the page is hydrated, and shows the messages in `Field.Error` instead. Before hydration, or with JavaScript off, the browser validates as usual. A submit button with `formnovalidate` skips validation, as it does in HTML.

Controls such as Checkbox, Switch, Radio Group, Slider, and Number Field submit through a hidden native input. Give the field a `name`, or a `field` from a form source, so that the input takes part in submission and validation.

## Custom validation

Pass a function to `validate` on `Field.Root`. It runs after the native constraints pass. In `onChange` mode it also runs while a constraint fails, and its message takes precedence. It receives the value and the values of the other named fields, and returns an error message, an array of messages, or `null` when the value is valid. It can be asynchronous.

`validationMode` on `Form` or `Field.Root` sets when the field validates:

- `onSubmit` (the default) validates every field when the form submits. After the first submit, each field validates again each time its value changes.
- `onBlur` validates the field when it loses focus.
- `onChange` validates the field each time its value changes.

`validationDebounceTime` waits the given number of milliseconds between `validate` calls in `onChange` mode. Use it for an asynchronous check, such as a request to your server.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';

	const taken = ['admin', 'root', 'alice'];

	async function checkUsername(value: unknown) {
		await new Promise((resolve) => setTimeout(resolve, 300));
		return taken.includes(String(value)) ? 'That username is taken.' : null;
	}
</script>

<Field.Root
	validationMode="onChange"
	validationDebounceTime={300}
	validate={checkUsername}
	class="flex w-72 flex-col gap-1 text-gray-900 dark:text-gray-100"
>
	<Field.Label class="text-sm font-medium">Username</Field.Label>
	<Field.Control
		required
		placeholder="Try alice"
		class="h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 data-[valid]:border-green-700 dark:border-gray-700 dark:bg-gray-900"
	/>
	<Field.Error class="text-sm text-red-700 dark:text-red-400" />
</Field.Root>
```

An asynchronous `validate` does not block a submit. Form submits with the result it already has.

To validate from your own code, read the Form or the Field with `bind:this` and call its `validate()` method. Form's `validate()` validates every field, or the field with the name you pass.

## Server-side validation

Pass errors from your server to the `errors` prop of Form. It is an object keyed by field name, with one message or an array of messages for each field. A field shows its server error in `Field.Error`, and the error clears as soon as the field's value changes.

After a submit, Form focuses the first invalid field when new errors arrive.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});
	let pending = $state(false);

	async function submitToServer(values: Record<string, unknown>) {
		pending = true;
		await new Promise((resolve) => setTimeout(resolve, 500));
		pending = false;
		const url = String(values.url);
		errors = url.startsWith('https://') ? {} : { url: 'The server only accepts https:// URLs.' };
	}
</script>

<Form
	bind:errors
	onFormSubmit={submitToServer}
	class="flex w-72 flex-col gap-4 text-gray-900 dark:text-gray-100"
>
	<Field.Root name="url" class="flex flex-col gap-1">
		<Field.Label class="text-sm font-medium">Homepage</Field.Label>
		<Field.Control
			type="url"
			required
			defaultValue="http://example.com"
			class="h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<button
		disabled={pending}
		class="h-9 rounded-md bg-gray-900 px-3.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900"
	>
		{pending ? 'Saving' : 'Save'}
	</button>
</Form>
```

Use `bind:errors`, so that the cleared error also leaves your state. A new object from the parent replaces the current errors. While a field shows a server error, it counts as invalid and blocks the next submit, until the user changes its value.

In SvelteKit, you do not need `errors`. Bind the form to a [remote form](#bind-a-sveltekit-remote-form) or a [form action](#bind-a-form-action), and the issues from the server show in each field.

## Display errors

`Field.Error` without children shows the field's current message. That is the browser's message for a failed constraint, the result of `validate`, the form source's issue, or the server error. Several messages render as a list.

To write your own message for one constraint, set `match` to the name of a `ValidityState` flag. That `Field.Error` shows only while that flag is set. Use this to translate messages:

```svelte
<Field.Root name="website">
	<Field.Label>Website</Field.Label>
	<Field.Control type="url" required />
	<Field.Error match="valueMissing">Enter a website.</Field.Error>
	<Field.Error match="typeMismatch">Enter a full URL, such as https://example.com.</Field.Error>
</Field.Root>
```

`match={true}` always shows the error. Use it when your own code decides whether to render it.

`Field.Validity` gives a snippet the full validity state of the field, such as each flag and every message:

```svelte
<Field.Validity>
	{#snippet children(validity)}
		{#if validity.validity.typeMismatch}
			<p>{validity.value} is not an email address.</p>
		{/if}
	{/snippet}
</Field.Validity>
```

### Show errors for the whole form

`Form.Error` shows the messages that no field shows:

- Issues on the whole form, such as `invalid('Signups are closed.')` in a remote form.
- Issues on a path that no mounted `Field.Root` binds.
- Entries in `errors` whose key no `Field.Root` has as its `name`.

It renders a `<div>` with `role="alert"`. When a submit fails with only messages for the whole form, Form has no field to focus, so the alert role makes a screen reader announce the message. `Form.Error` renders nothing while there is no message.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});
</script>

<Form
	bind:errors
	onFormSubmit={() => (errors = { form: 'Signups are closed today. Try again tomorrow.' })}
	class="flex w-72 flex-col gap-4 text-gray-900 dark:text-gray-100"
>
	<Form.Error
		class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
	/>
	<Field.Root name="email" class="flex flex-col gap-1">
		<Field.Label class="text-sm font-medium">Email</Field.Label>
		<Field.Control
			type="email"
			required
			defaultValue="alice@example.com"
			class="h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<button
		class="h-9 rounded-md bg-gray-900 px-3.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 dark:bg-gray-100 dark:text-gray-900"
	>
		Sign up
	</button>
</Form>
```

## Reset

A `<button type="reset">` in the form resets it, as in HTML. Each control returns to its `defaultValue` or `defaultChecked`, and a bound value follows. Each field clears its dirty, touched, and validity state, and Form clears its `errors`. With a form source, the reset also hides the source's issues.

<Callout title="Known SvelteKit issue: reset and remote forms">

In SvelteKit 3.0.1, a remote form keeps the edited values in `fields.x.value()` after the user clicks a reset button, while the inputs show their defaults. Form works around it. It resets once more a task later, so that the remote form reads the reset values. A plain `<form {...remote}>` without Form still has the issue.

</Callout>

## Bind a SvelteKit remote form

Pass a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form) to the `form` prop of Form. Pass each of its fields to the `field` prop of a `Field.Root`. The remote form then owns the values and the issues. Field shows them, and Form sends the submit through the remote form.

Remote functions are experimental in SvelteKit. Turn them on with `experimental: { remoteFunctions: true }` in the `sveltekit()` options in `vite.config.ts`.

Put the schema in its own module, so that the server and the page can both import it. Any [Standard Schema](https://standardschema.dev) library works. These examples use Valibot.

```ts
// src/routes/signup/schema.ts
import * as v from 'valibot';

export const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Enter a valid email')),
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters')),
	age: v.pipe(v.number('Enter your age'), v.minValue(18, 'You must be 18 or older'))
});
```

Create the remote form with `form(schema, handler)`. Call `invalid` with an issue on a field, or with a message for the whole form:

```ts
// src/routes/signup/signup.remote.ts
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

```svelte
<!-- src/routes/signup/+page.svelte -->
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

`Field.Control` takes its name and value from the field. The name carries SvelteKit's encoding, such as `n:age` for a number, so do not set `name` or `value` on the control. The field's issues show in `Field.Error`, and the field's `touched` and `dirty` state sets `data-touched` and `data-dirty`.

A submit runs these checks in order:

1. The native constraints, such as `required` and `type="email"`. A failed constraint stops the submit and focuses the field.
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

## Bind a form action

A classic [form action](https://svelte.dev/docs/kit/form-actions) works the same way. `actionForm` from `@sveltery/base/form/kit` builds a form source from the page's `form` prop. `parseForm` reads the request on the server with the same field encoding as a remote form. The Field markup does not change.

In the action, call `parseForm` with the request and the schema. Return `submission.fail()` to send the issues back. Pass it more issues, built with `submission.issue`, or a string for an issue on the whole form:

```ts
// src/routes/signup/+page.server.ts
import { parseForm } from '@sveltery/base/form/kit';
import { signupSchema } from './schema.js';

export const actions = {
	default: async ({ request }) => {
		const submission = await parseForm(request, signupSchema);
		if (!submission.ok) return submission.fail();
		if (await isRegistered(submission.data.email)) {
			return submission.fail(submission.issue.email('Email already taken'));
		}
		if (signupsClosed()) return submission.fail('Signups are closed');
		return { welcome: submission.data.name };
	}
};
```

On the page, pass `form` to `actionForm` as a getter, so that the source follows each new value of the prop:

```svelte
<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { actionForm } from '@sveltery/base/form/kit';
	import { signupSchema } from './schema.js';

	let { form } = $props();
	const f = actionForm(signupSchema, () => form);
</script>

<Form form={f}>
	<Form.Error />
	<Field.Root field={f.fields.email} type="email">
		<Field.Label>Email</Field.Label>
		<Field.Control required />
		<Field.Error />
	</Field.Root>
	<!-- The name and age fields, as in the remote form example. -->
	<button disabled={f.pending > 0}>Sign up</button>
	{#if f.result}
		<p>Welcome, {f.result.welcome}</p>
	{/if}
</Form>
```

`actionForm` runs `use:enhance` for you, so do not add it. The source has the same `fields`, `pending`, `submitted`, `result`, and `validate()` as a remote form. The schema runs in the browser before each submit, and only a valid submit reaches the server.

For a named action, pass its name to `actionForm`, such as `actionForm(loginSchema, () => form, { action: 'login' })`. The form posts to `?/login` and reads only that action's issues and result, so several forms can share a page. `parseForm` reads the action name from the request URL. Pass `{ action }` to `parseForm` only when you pass it `FormData` instead of the request.

## Customize the submit

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

Pass the callback to Form, not to the source's `enhance()` method. Form installs its own callback on the source, so that it can tell issues from the server apart from issues from the schema, and it calls yours from there.

## Bind composite controls

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

The control starts from the source's value when the source has one, and from `defaultValue` when it does not. A form reset returns the control to `defaultValue`. When your code calls `set()` on the field, the control shows the new value, with no `onValueChange` call. In development, a control whose kind does not match the `type` on its `Field.Root` logs an error that names both.

A checkbox sends nothing when it is unchecked, so every boolean in the schema must be optional, such as `v.optional(v.boolean(), false)`. `actionForm` and `parseForm` reject a schema with a required boolean at the type level, as SvelteKit does for a remote form.

## Work without JavaScript

A form bound to a remote form or a form action works before the page hydrates and with JavaScript off:

- The server renders no `novalidate`, so the browser checks `required`, `type`, and the other constraints, and an empty required field never reaches the server.
- The form posts to the server, and the page renders again with the issues in each `Field.Error` and the whole-form issues in `Form.Error`.
- Each field shows the value the user submitted.
- After a success, `f.result` holds the return value.

Once the page hydrates, Form sets `novalidate` and shows every message in `Field.Error`.

## Form libraries

A form library can own the values and the validation, while Field shows the state. Pass the library's state to `Field.Root` through these props, which take precedence over the state Field tracks itself:

- `invalid` marks the field invalid.
- `dirty` marks the value as changed from its initial value.
- `touched` marks the field as visited.

Bind the value to the library with `bind:value`, or with a getter and setter pair. Render the library's message in a `Field.Error` with `match={true}`, inside an `{#if}` that checks for an error. This demo uses component state in place of a library:

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';

	let value = $state('');
	let touched = $state(false);
	const error = $derived(/^\d{5}$/.test(value) ? null : 'Enter a 5-digit ZIP code.');
</script>

<Field.Root
	name="zip"
	invalid={touched && error !== null}
	{touched}
	dirty={value !== ''}
	class="flex w-72 flex-col gap-1 text-gray-900 dark:text-gray-100"
>
	<Field.Label class="text-sm font-medium">ZIP code</Field.Label>
	<Field.Control
		bind:value
		onblur={() => (touched = true)}
		inputmode="numeric"
		class="h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-700 dark:border-gray-700 dark:bg-gray-900"
	/>
	{#if touched && error}
		<Field.Error match={true} class="text-sm text-red-700 dark:text-red-400">{error}</Field.Error>
	{/if}
</Field.Root>
```

`invalid` sets `aria-invalid` on the control and `data-invalid` on every part of the field. It also blocks a Form submit. To let the library decide whether to submit, handle the submit through the library, not through `onFormSubmit`.

### TanStack Form

`tanstackField` from `@sveltery/base/form/tanstack` turns a [TanStack Form](https://tanstack.com/form) field into a field that `Field.Root` binds to. Call it inside the snippet of `form.Field`:

```svelte
<script lang="ts">
	import { createForm, revalidateLogic } from '@tanstack/svelte-form';
	import * as v from 'valibot';
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { tanstackField } from '@sveltery/base/form/tanstack';

	const schema = v.object({
		email: v.pipe(v.string(), v.email('Invalid email address')),
		seats: v.pipe(v.number(), v.minValue(1, 'At least one seat'))
	});

	const form = createForm(() => ({
		defaultValues: { email: '', seats: 1 },
		validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
		validators: { onDynamic: schema },
		onSubmit: ({ value }) => save(value)
	}));
</script>

<Form
	onsubmit={(event) => {
		event.preventDefault();
		form.handleSubmit();
	}}
>
	<form.Field name="email">
		{#snippet children(field)}
			<Field.Root field={tanstackField(field)} type="email">
				<Field.Label>Email</Field.Label>
				<Field.Control />
				<Field.Error />
			</Field.Root>
		{/snippet}
	</form.Field>
	<form.Field name="seats">
		{#snippet children(field)}
			<Field.Root field={tanstackField(field)} type="number">
				<Field.Label>Seats</Field.Label>
				<Field.Control />
				<Field.Error />
			</Field.Root>
		{/snippet}
	</form.Field>
	<button>Submit</button>
</Form>
```

TanStack owns the value and the validation. The control reports each edit to the field, and Field reports blur. The field's `meta.errors` show in `Field.Error`, and its touched and dirty state sets `data-touched` and `data-dirty`. A native form reset resets the field to its TanStack default. `type` is checked against the field's value, as it is for a remote form, and the composite controls bind the same way.

Form takes no `form` prop here. Each field binds on its own, and TanStack runs the submit through `form.handleSubmit()`.
