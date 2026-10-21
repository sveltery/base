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
	<Form.Error />
	<Field.Root>
		<Field.Label />
		<Field.Control />
		<Field.Error />
	</Field.Root>
</Form>
```

## Examples

### Submit with a SvelteKit remote form

Pass a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form) to the `form` prop, and give each `Field.Root` the path of its field as `name`. Each Field shows its own issues, and `Form.Error` shows the issues on the whole form. [Use a SvelteKit remote form](/handbook/sveltekit#use-a-sveltekit-remote-form) has the full example.

```svelte title="A remote form"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { signup } from './signup.remote.js';
</script>

<Form form={signup}>
	<Form.Error />
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Field.Control type="email" required />
		<Field.Error />
	</Field.Root>
	<button>Sign up</button>
</Form>
```

The `form` prop replaces `errors`, `values`, `onsubmit`, `method`, and `action`, so TypeScript rejects them next to it.

### Submit with a form action

Forms can also post to a [SvelteKit form action](https://svelte.dev/docs/kit/form-actions). Return the action's errors and the submitted values from `fail()`, and pass them to `errors` and `values`. The demo below mimics the action with `onsubmit`. [Connect a form action](/handbook/sveltekit#connect-a-form-action) shows the real `+page.server.ts`.

<DemoFormAction />

### Validate before the submit

Form leaves the browser's constraint validation on. The browser blocks a submit while a control fails `required`, `type`, `pattern`, or a sync `validate`, and `onsubmit` does not run. Each Field shows its message instead of the browser's bubble, and Form focuses the first invalid control. Pass `novalidate` to turn the browser's check off.

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

<TypesForm.Form />

<TypesForm.Error />
