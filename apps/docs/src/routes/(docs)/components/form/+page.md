# Form

<Subtitle>
  A native form element with consolidated error handling.
</Subtitle>

<Meta name="description" content="A native form element with consolidated error handling." />

<DemoFormHero />

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

Forms can be submitted with a [SvelteKit form action](https://svelte.dev/docs/kit/form-actions) instead of `onsubmit`. Return the action's errors from `fail()` and pass them to `errors`. The demo below mimics the action with `onFormSubmit`. [Connect a form action](/handbook/sveltekit#connect-a-form-action) shows the real `+page.server.ts`.

<DemoFormAction />

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

<DemoFormZod />

## API reference

<script>
	import { DemoFormHero } from './demos/hero';
	import { DemoFormAction } from './demos/form-action';
	import { DemoFormZod } from './demos/zod';
	import { TypesForm } from './types';
</script>

<TypesForm />
