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
	<Field.Root name="email">
		<Field.Label />
		<Field.Control />
		<Field.Error />
	</Field.Root>
</Form>
```

`Form` renders a native `<form>`. Each `Field.Root` inside it registers with the form. On submit, the form validates every registered field, focuses the first invalid control, and blocks the submission while any field is invalid.

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

### Native submit

Without `onFormSubmit`, the form submits natively after validation, and `onsubmit` runs first. Use this for plain `method="post"` forms and for a SvelteKit form action. An invalid form stops the submit before any later `submit` listener on the form runs, including the one SvelteKit's `enhance` adds. A submit button with `formnovalidate` skips validation, as it does in a native form. Read [Forms](/handbook/forms) for the full pattern and [SvelteKit](/handbook/sveltekit) for form actions.

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
- Upstream can pass a React action to `Form`. In Svelte, use a SvelteKit form action or a remote form function, and leave `onFormSubmit` unset. `onFormSubmit` always cancels the native submit.
- The form validates in a capture-phase `submit` listener. An invalid submit calls `preventDefault()` and `stopImmediatePropagation()`, so SvelteKit's `enhance` and other later listeners do not run. Upstream blocks only with `preventDefault()`.
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
