---
title: Form
description: A native form element with consolidated error handling.
---

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});
	let loading = $state(false);
	let saved = $state('');

	async function fakeServer(url: string) {
		await new Promise((resolve) => setTimeout(resolve, 600));
		return new URL(url).hostname.endsWith('example.com')
			? { error: 'The example domain is not allowed.' }
			: { error: null };
	}

	async function submit(values: Record<string, unknown>) {
		loading = true;
		saved = '';
		const response = await fakeServer(String(values.url));
		loading = false;
		if (response.error) errors = { url: response.error };
		else saved = String(values.url);
	}
</script>

<Form bind:errors onFormSubmit={submit} class="flex w-72 flex-col gap-4">
	<Field.Root name="url" class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Homepage</Field.Label>
		<Field.Control
			type="url"
			required
			pattern="https?://.*"
			placeholder="https://example.com"
			disabled={loading}
			class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<button
		type="submit"
		disabled={loading}
		class="h-10 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
	>
		{loading ? 'Saving…' : 'Save'}
	</button>
	{#if saved}
		<p class="text-sm text-green-700 dark:text-green-400">Saved {saved}</p>
	{/if}
</Form>
```

Enter an `example.com` address to see an error that comes back from the server. Enter text that is not a URL to see the browser's own message.

## Anatomy

Import the components and wrap your fields in a form:

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
</script>

<Form>
	<Form.Error />
	<Field.Root name="email">
		<Field.Label />
		<Field.Control />
		<Field.Error />
	</Field.Root>
</Form>
```

`Form` renders a native `<form>`. Each `Field.Root` inside it registers with the form. On submit, the form validates every registered field, focuses the first invalid control, and blocks the submission while any field is invalid. `Form.Error` shows the messages that no field shows. When the first invalid control can be hidden, such as on an inactive step, pass `onFocusInvalid` to reveal it. Form calls it with the `control` and its `field` in place of focusing, waits for it, and then focuses the control unless focus moved meanwhile. Keep inactive steps mounted and hidden, because a field that is not rendered does not register.

[Forms](/handbook/forms) is the guide to validation, server errors, and form sources.

## Examples

### Validation mode

`validationMode` sets when the fields in the form validate:

- `onSubmit` validates when the form submits. After the first submit, each field revalidates when its value changes. This is the default.
- `onBlur` validates a field when its control loses focus.
- `onChange` validates a field on every change.

A `validationMode` on a `Field.Root` takes precedence over the one on the form. Pick a mode below and type a short username.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	let mode = $state<'onSubmit' | 'onBlur' | 'onChange'>('onChange');
</script>

<div class="flex w-72 flex-col gap-4 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		Validation mode
		<select
			bind:value={mode}
			class="rounded-md border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
		>
			<option value="onSubmit">onSubmit</option>
			<option value="onBlur">onBlur</option>
			<option value="onChange">onChange</option>
		</select>
	</label>
	<Form validationMode={mode} class="flex flex-col gap-4">
		<Field.Root
			name="username"
			validate={(value) => (String(value).length < 4 ? 'Use at least 4 characters.' : null)}
			class="flex flex-col items-start gap-1"
		>
			<Field.Label class="font-medium">Username</Field.Label>
			<Field.Control
				required
				class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900"
			/>
			<Field.Error class="text-red-700 dark:text-red-400" />
		</Field.Root>
		<button
			type="submit"
			class="h-10 rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			Submit
		</button>
	</Form>
</div>
```

### Server errors

`errors` takes an object whose keys are field names. A value is one message or an array of messages. A `Field.Error` in the field with that `name` shows the message, and the form focuses the first control that has an error.

Bind `errors` with `bind:errors`. When the user edits a field, the form removes that field's key from the object, so the error clears as soon as the user starts to fix it. If you pass `errors` without `bind:`, a new object from the parent replaces the current errors.

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});

	async function register(values: Record<string, unknown>) {
		const response = await fetch('/api/register', {
			method: 'POST',
			body: JSON.stringify(values)
		});
		if (!response.ok) errors = (await response.json()).errors;
	}
</script>

<Form bind:errors onFormSubmit={register}>…</Form>
```

A form reset clears `errors`.

### Submit values as an object

`onFormSubmit` receives the value of every named field as one object, after all fields pass validation. The form cancels the native submission before it calls `onFormSubmit`, so the page does not navigate. Use it to reshape the values before you send them to an API. The second argument carries the submit event.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	let submitted = $state<Record<string, unknown> | null>(null);
</script>

<div class="flex w-72 flex-col gap-4 text-sm text-gray-900 dark:text-gray-100">
	<Form onFormSubmit={(values) => (submitted = values)} class="flex flex-col gap-4">
		<Field.Root name="product" class="flex flex-col items-start gap-1">
			<Field.Label class="font-medium">Product</Field.Label>
			<Field.Control
				required
				defaultValue="Coffee beans"
				class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900"
			/>
		</Field.Root>
		<Field.Root name="notes" class="flex flex-col items-start gap-1">
			<Field.Label class="font-medium">Notes</Field.Label>
			<Field.Control
				placeholder="Optional"
				class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
			/>
		</Field.Root>
		<button
			type="submit"
			class="h-10 rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			Order
		</button>
	</Form>
	{#if submitted}
		<pre class="rounded-md bg-gray-100 p-3 dark:bg-gray-800">{JSON.stringify(
				submitted,
				null,
				2
			)}</pre>
	{/if}
</div>
```

`onFormSubmit` is typed through the `Form` generic. Pass a type to check the values:

```svelte
<Form onFormSubmit={(values: { product: string; quantity: number | null }) => save(values)}>…</Form>
```

### Bind a form source

`form` takes a form source, such as a SvelteKit remote form. Form spreads the source's `method`, `action`, and attachment onto the `<form>`, and the source sends the submit. Pass each of the source's fields to `field` on a `Field.Root`:

```svelte
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
	<button disabled={f.pending > 0}>Sign up</button>
</Form>
```

The fields validate before the source sees the submit. An invalid field blocks the submit, and no request is sent. The source still runs its own client validation and shows its issues. Do not combine `form` with `onFormSubmit`. In development, Form warns when you do. [Bind a SvelteKit remote form](/handbook/forms#bind-a-sveltekit-remote-form) shows the server side. For a classic form action, pass its errors to `errors` instead, as [Connect a form action](/handbook/forms#connect-a-form-action) shows.

### Customize a source submit

Without `enhance`, a source submit sends the request and resets the form when it succeeds. `enhance` replaces that step. It receives the source's enhance instance. Nothing is sent until the callback calls `submit()`, which resolves to `true` on success:

```svelte
<Form
	form={f}
	enhance={async ({ submit }) => {
		if (await submit()) toast('Saved');
	}}
>
	…
</Form>
```

This form keeps its values after a successful submit. Pass the callback to Form, not to the source's own `enhance()` method, because Form installs its own callback on the source and calls yours from there.

### Show errors for the whole form

`Form.Error` shows the messages that no `Field.Error` shows: issues on the whole form, issues on a path that no mounted field binds, and `errors` entries whose key no field has as its `name`. It renders a `<div>` with `role="alert"`, and renders nothing while there is no message. Submit this form to see a message for the whole form.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});
</script>

<Form
	bind:errors
	onFormSubmit={() => (errors = { form: 'The shop is closed for maintenance.' })}
	class="flex w-72 flex-col gap-4 text-sm text-gray-900 dark:text-gray-100"
>
	<Form.Error
		class="rounded-md border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
	/>
	<Field.Root name="product" class="flex flex-col items-start gap-1">
		<Field.Label class="font-medium">Product</Field.Label>
		<Field.Control
			required
			defaultValue="Coffee beans"
			class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900"
		/>
		<Field.Error class="text-red-700 dark:text-red-400" />
	</Field.Root>
	<button
		type="submit"
		class="h-10 rounded-md border border-gray-200 bg-gray-50 px-3.5 font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		Order
	</button>
</Form>
```

### Native submit

Without `onFormSubmit` or `form`, the form submits natively after validation, and `onsubmit` runs first. Use this for plain `method="post"` forms. An invalid form cancels the submit with `preventDefault()`, and `onsubmit` does not run. A later `submit` listener on the form still runs, as upstream. If that listener sends the form, as `use:enhance` does, it cancels when `isSubmitBlocked(form)` returns `true`. A submit button with `formnovalidate` skips validation, as it does in a native form. For a SvelteKit form action, add `use:enhance` with `fromAction`, cancel a blocked submit in its submit function, and pass the action's errors to `errors`. Read [Forms](/handbook/forms) for the full pattern.

### Validate by hand

Bind the form with `bind:this` and call `validate()` to validate every registered field. Pass a field name to validate one field.

```svelte
<script lang="ts">
	import type { FormActions } from '@sveltery/base/form';

	let form = $state<FormActions>();
</script>

<Form bind:this={form}>…</Form>
<button type="button" onclick={() => form?.validate()}>Check all</button>
<button type="button" onclick={() => form?.validate('email')}>Check email</button>
```

### Validate with a schema

Run your schema in `onFormSubmit` and map its issues to `errors`. This example uses Zod.

```svelte
<script lang="ts">
	import { z } from 'zod';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	const schema = z.object({
		username: z.string().min(3, 'Use at least 3 characters.'),
		email: z.email('Enter a valid email address.')
	});

	let errors = $state<FormErrors>({});

	function submit(values: Record<string, unknown>) {
		const result = schema.safeParse(values);
		if (!result.success) {
			errors = z.flattenError(result.error).fieldErrors;
			return;
		}
		errors = {};
		save(result.data);
	}
</script>

<Form bind:errors onFormSubmit={submit}>…</Form>
```

## Differences from Base UI

- `errors` is a bindable prop. Use `bind:errors` so the form can clear a key when the user edits that field.
- Upstream takes an `actionsRef` prop. In Svelte, use `bind:this` on `Form` and call `validate()`.
- Upstream can pass a React action to `Form`. In Svelte, pass a SvelteKit remote form to `form`, or use a form action with `use:enhance`, and leave `onFormSubmit` unset. `onFormSubmit` always cancels the native submit.
- `form`, `enhance`, `onFocusInvalid`, `Form.Error`, and `isSubmitBlocked` have no upstream counterpart.
- The form validates in a capture-phase `submit` listener, where upstream validates in its React `onSubmit`. As upstream, an invalid submit gets only `preventDefault()`, so later `submit` listeners still run. `isSubmitBlocked` tells a listener that does not check `defaultPrevented`, such as `use:enhance`, that Form blocked the submit.
- A submitter with `formnovalidate` skips validation. Upstream validates anyway.
- `novalidate` is on by default and the form sets it after hydration. The server renders no `novalidate`, so a page without JavaScript keeps the browser's validation.
- A form reset restores each control to its `defaultValue` or `defaultChecked`. Each field clears its dirty, touched, and validity state, and the form clears `errors` and its submit count. Upstream leaves those as they were. A control outside the `<form>` that joins it with the `form` attribute restores too.
- Slider, Number Field, and OTP Field fire bubbling `input` and `change` events on their named inputs, so a plain listener on the form sees their changes.
- `onsubmit` runs after validation, and only when no field blocks the submit. It does not skip `onFormSubmit`.
- Parts take `class` and a `style` string, not functions of state. The form has no state attributes.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names such as `onsubmit`.

## API reference

### Form

<ApiPart name="form" part="Form" />

`Form` sets no data attributes.

### Error

<ApiPart name="form" part="Error" />

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-starting-style` | Present when the error begins animating in. |
| `data-ending-style`   | Present when the error is animating out.    |

### isSubmitBlocked

```ts
function isSubmitBlocked(form: HTMLFormElement): boolean;
```

Returns `true` when Form blocked the latest submit of `form`, and `false` when Form let it through or a `formnovalidate` submitter skipped validation. Form decides in a capture-phase `submit` listener, so the answer is ready in a bubble-phase `submit` listener on the form, such as the one `use:enhance` adds. The next submit replaces the answer. Import it from `@sveltery/base/form`.
