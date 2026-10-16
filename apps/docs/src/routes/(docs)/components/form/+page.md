# Form

<Subtitle>
  A native form element with consolidated error handling.
</Subtitle>

<Meta name="description" content="A native form element with consolidated error handling." />

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});
	let loading = $state(false);

	async function submitForm(value: string) {
		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		try {
			const url = new URL(value);

			if (url.hostname.endsWith('example.com')) {
				return { error: 'The example domain is not allowed' };
			}
		} catch {
			return { error: 'This is not a valid URL' };
		}

		return { success: true };
	}
</script>

<Form
	class="flex w-full max-w-64 flex-col gap-4"
	bind:errors
	onsubmit={async (event) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const value = formData.get('url') as string;

		loading = true;
		const response = await submitForm(value);
		const serverErrors: FormErrors = response.error ? { url: response.error } : {};

		errors = serverErrors;
		loading = false;
	}}
>
	<Field.Root name="url" class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Homepage</Field.Label>
		<Field.Control
			type="url"
			required
			defaultValue="https://example.com"
			placeholder="https://example.com"
			pattern="https?://.*"
			class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<Button
		disabled={loading}
		focusableWhenDisabled
		type="submit"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Submit
	</Button>
</Form>
```

## Anatomy

Form is composed together with [Field](/components/field). Import the components and place them together:

```svelte title="Anatomy"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
</script>

<Form>
	<Field.Root>
		<Field.Label />
		<Field.Control />
		<Field.Error />
	</Field.Root>
</Form>
```

## Examples

### Submit with a Server Function

Forms can be submitted with a [SvelteKit form action](https://svelte.dev/docs/kit/form-actions) instead of `onsubmit`. Return the action's errors from `fail()` and pass them to `errors`. The demo below mimics the action with `onFormSubmit`. [Connect a form action](/handbook/sveltekit#connect-a-form-action) shows the real `+page.server.ts` and `use:enhance`.

```svelte demo
<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	let errors = $state<FormErrors>({});
	let loading = $state(false);

	async function submitForm(formValues: Record<string, unknown>) {
		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		try {
			const username = formValues.username as string | null;

			if (username === 'admin') {
				return { success: false, serverErrors: { username: "'admin' is reserved for system use" } };
			}

			const success = Math.random() > 0.5;

			if (!success) {
				return {
					serverErrors: { username: `${username} is unavailable` }
				};
			}
		} catch {
			return { serverErrors: { username: 'A server error has occurred' } };
		}

		return {};
	}
</script>

<Form
	class="flex w-full max-w-64 flex-col gap-4"
	bind:errors
	onFormSubmit={async (formValues) => {
		loading = true;
		const result = await submitForm(formValues);
		errors = result.serverErrors ?? {};
		loading = false;
	}}
>
	<Field.Root name="username" class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Username</Field.Label>
		<Field.Control
			type="text"
			autocomplete="username"
			required
			defaultValue="admin"
			placeholder="e.g. alice132"
			class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<Button
		type="submit"
		disabled={loading}
		focusableWhenDisabled
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Submit
	</Button>
</Form>
```

### Submit form values as a JavaScript object

You can use `onFormSubmit` instead of the native `onsubmit` to access form values as a JavaScript object. This is useful when you need to transform the values before submission, or integrate with 3rd party APIs.

```svelte title="Submission using onFormSubmit"
<Form
	onFormSubmit={async (formValues: { id: string; quantity: number }) => {
		const payload = {
			product_id: formValues.id,
			order_quantity: formValues.quantity
		};

		const response = await fetch('https://api.example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	}}
/>
```

When used, `preventDefault` is called on the native submit event.

### Using with Zod

When parsing the schema using `schema.safeParse()`, the `z.flattenError(result.error).fieldErrors` data can be used to map the errors to each field's `name`.

```svelte demo
<script lang="ts">
	import { z } from 'zod';
	import { Button } from '@sveltery/base/button';
	import { Field } from '@sveltery/base/field';
	import { Form, type FormErrors } from '@sveltery/base/form';

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		age: z.coerce.number('Age must be a number').positive('Age must be a positive number')
	});

	async function submitForm(formValues: Record<string, unknown>) {
		const result = schema.safeParse(formValues);

		if (!result.success) {
			return {
				errors: z.flattenError(result.error).fieldErrors as FormErrors
			};
		}

		return {
			errors: {}
		};
	}

	let errors = $state<FormErrors>({});
</script>

<Form
	class="flex w-full max-w-64 flex-col gap-4"
	bind:errors
	onFormSubmit={async (formValues) => {
		const response = await submitForm(formValues);
		errors = response.errors;
	}}
>
	<Field.Root name="name" class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Name</Field.Label>
		<Field.Control
			placeholder="Enter name"
			class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<Field.Root name="age" class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Age</Field.Label>
		<Field.Control
			placeholder="Enter age"
			class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
		/>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	<Button
		type="submit"
		class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Submit
	</Button>
</Form>
```

## API reference

<script>
	import { TypesForm } from './types';
</script>

<TypesForm.Form />

### Error

<TypesForm.Error />

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-starting-style` | Present when the error begins animating in. |
| `data-ending-style`   | Present when the error is animating out.    |
