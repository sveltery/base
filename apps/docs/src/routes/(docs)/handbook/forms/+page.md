# Forms

<Subtitle>
  A guide to building forms with Sveltery Base components.
</Subtitle>

<Meta name="description" content="A guide to building forms with Sveltery Base components." />

Sveltery Base form control components extend the native [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api) so you can build forms for collecting user input or providing control over an interface. They also integrate seamlessly with third-party libraries like [Superforms](#superforms) and [TanStack Form](#tanstack-form).

<script>
	import { DemoSvelteryBaseForm } from './demos/hero';
	import { DemoSuperforms } from './demos/superforms';
	import { DemoTanstackForm } from './demos/tanstack-form';
</script>

<DemoSvelteryBaseForm />

## Naming form controls

Form controls must have an accessible name in order to be recognized by assistive technologies. Use the label strategy below for each control type.

### Input controls

Use `<Field.Label>` or a native `<label>` to label the following controls:

- `Input`
- `NumberField`
- `OTPField`
- `Autocomplete`
- `Combobox` (input outside popup)
- `Checkbox`
- `Radio`
- `Switch`

You can implicitly label `<Checkbox>`, `<Radio>` and `<Switch>` components by enclosing them with `<Field.Label>`:

```svelte title="Implicitly labeling a switch"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Switch } from '@sveltery/base/switch';
</script>

<Field.Root>
	<Field.Label>
		<Switch.Root />
		Developer mode
	</Field.Label>
	<Field.Description>Enables extra tools for web developers</Field.Description>
</Field.Root>
```

### Trigger-based controls

- `Combobox` (input inside popup): use `<Combobox.Label>`.
- `Select`: use `<Select.Label>`.
- `Slider`: use `<Slider.Label>`. For multi-thumb sliders, also add an `aria-label` on each `<Slider.Thumb>` to distinguish the thumbs.

### Fallback

If no visible label is rendered, provide `aria-label` on the actual form control.

### Describing the control

`<Field.Description>` automatically assigns an accessible description:

```svelte title="Labeling select and slider"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';
	import { Select } from '@sveltery/base/select';
	import { Slider } from '@sveltery/base/slider';
</script>

<Form>
	<Field.Root>
		<Select.Root>
			<Select.Label>Time zone</Select.Label>
			<Select.Trigger />
		</Select.Root>
		<Field.Description>Used for notifications and reminders</Field.Description>
	</Field.Root>

	<Field.Root>
		<Slider.Root defaultValue={50}>
			<Slider.Label>Zoom level</Slider.Label>
			<Field.Description>Adjust the size of the user interface</Field.Description>
			<Slider.Control>
				<Slider.Track>
					<Slider.Thumb />
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	</Field.Root>
</Form>
```

### Labeling control groups

Compose `<Fieldset>` when a single label applies to multiple controls, such as a range slider with multiple thumbs or a section that combines several inputs. For checkbox and radio groups, keep the group label in `<Fieldset.Legend>` and wrap each option with `<Field.Item>`:

```svelte title="Composing range slider and radio group with fieldset"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
	import { Slider } from '@sveltery/base/slider';
</script>

<Form>
	<Field.Root>
		<!-- @highlight-start -->
		<Fieldset.Root>
			<Fieldset.Legend>Price range</Fieldset.Legend>
			<!-- @highlight-end -->
			<Slider.Root defaultValue={[20, 80]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Thumb index={0} aria-label="Minimum price" />
						<Slider.Thumb index={1} aria-label="Maximum price" />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
			<!-- @highlight -->
		</Fieldset.Root>
	</Field.Root>

	<Field.Root>
		<!-- @highlight-start -->
		<Fieldset.Root>
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<!-- @highlight-end -->
			<RadioGroup>
				<Radio.Root value="ssd" />
				<Radio.Root value="hdd" />
			</RadioGroup>
			<!-- @highlight -->
		</Fieldset.Root>
	</Field.Root>
</Form>
```

`<Field.Item>` should enclose each checkbox or radio option so every control has its own label and description:

```svelte title="Explicitly labeling checkboxes in a checkbox group"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
</script>

<Field.Root>
	<CheckboxGroup>
		<Fieldset.Legend>Backup schedule</Fieldset.Legend>
		<!-- @highlight -->
		<Field.Item>
			<Checkbox.Root value="daily" />
			<Field.Label>Daily</Field.Label>
			<Field.Description>Daily at 00:00</Field.Description>
			<!-- @highlight-start -->
		</Field.Item>
		<Field.Item>
			<!-- @highlight-end -->
			<Checkbox.Root value="monthly" />
			<Field.Label>Monthly</Field.Label>
			<Field.Description>On the 5th of every month at 23:59</Field.Description>
			<!-- @highlight -->
		</Field.Item>
	</CheckboxGroup>
</Field.Root>
```

## Building form fields

Pass the `name` prop to `<Field.Root>` to include the wrapped control's value when a parent form is submitted:

```svelte title="Assigning field name to combobox"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';
	import { Combobox } from '@sveltery/base/combobox';
</script>

<Form>
	<!-- @highlight-start -->
	<!-- @highlight-text "name" -->
	<Field.Root name="country">
		<!-- @highlight-end -->
		<Field.Label>Country of residence</Field.Label>
		<Combobox.Root />
	</Field.Root>
</Form>
```

## Submitting data

You can take over form submission with the native `onsubmit`. It runs only after the browser's constraint check passes:

```svelte title="Native submission using onsubmit"
<script lang="ts">
	import { Form } from '@sveltery/base/form';
</script>

<Form
	// @highlight-start
	onsubmit={async (event) => {
		// Prevent the browser's default full-page refresh
		event.preventDefault();
		// Create a FormData object
		const formData = new FormData(event.currentTarget);
		// Send the FormData instance in a fetch request
		// @highlight-end
		await fetch('https://api.example.com', {
			method: 'POST',
			body: formData
		});
	}}
/>
```

To post the form without JavaScript, leave `onsubmit` off and give Form a `method` and an `action`, or a SvelteKit remote form through the `form` prop. [SvelteKit](/handbook/sveltekit) shows both.

## Constraint validation

Sveltery Base form components support native HTML validation attributes for many validation rules:

- `required` specifies a required field.
- `minlength` and `maxlength` specify a valid length for text fields.
- `pattern` specifies a regular expression that the field value must match.
- `step` specifies an increment that numeric field values must be an integral multiple of.

```svelte title="Defining constraint validation on a text field"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root name="website">
	<Field.Control type="url" required pattern="https?://.*" />
	<Field.Error />
</Field.Root>
```

The browser's constraint check is the submit gate. When a submit fails it, each Field shows its message in `<Field.Error>` instead of the browser's bubble, and Form focuses the first invalid control. A control outside any Field keeps the browser's bubble. Pass `novalidate` to `<Form>` to turn the check off.

Sveltery Base form components use a hidden input to participate in native form submission and validation. To anchor the hidden input near a control so the native validation bubble points to the correct area, ensure the component has been given a `name`, and wrap controls in a relatively positioned container for best results.

```svelte title="Positioning hidden inputs"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Select } from '@sveltery/base/select';
</script>

<Field.Root name="apple">
	<Select.Root>
		<Select.Label>Apple</Select.Label>
		<div class="relative">
			<Select.Trigger />
		</div>
	</Select.Root>
</Field.Root>
```

## Custom validation

You can add custom validation logic by passing a synchronous or asynchronous validation function to the `validate` prop, which runs after native validations have passed. Field keeps a synchronous message in the control's custom validity whatever the `validationMode`, so the browser blocks the submit while it fails. An asynchronous `validate` does not block the submit.

Use the `validationMode` prop to configure when validation is performed:

- `onSubmit` (default) validates all fields when the containing `<Form>` is submitted, afterwards invalid fields revalidate when their value changes.
- `onBlur` validates the field when focus moves away.
- `onChange` validates the field when the value changes, for example, after each keypress in a text field or when a checkbox is checked or unchecked.

`validationDebounceTime` can be used to debounce the function in use cases such as asynchronous requests or text fields that validate `onChange`.

```svelte title="Text input using custom asynchronous validation"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root
	name="username"
	// @highlight-start
	validationMode="onChange"
	validationDebounceTime={300}
	validate={async (value) => {
		// @highlight-end
		if (value === 'admin') {
			/* return an error message when invalid */
			return 'Reserved for system use.';
		}

		const result = await fetch(/* check the availability of a username from an external API */);

		if (!result) {
			return `${value} is unavailable.`;
		}

		/* return `null` when valid */
		return null;
	}}
>
	<Field.Control required minlength={3} />
	<Field.Error />
</Field.Root>
```

## Server-side validation

You can pass errors returned by (post-submission) server-side validation to the `errors` prop, which will be merged into the client-side field state for display.

This should be an object with field names as keys, and an error string or array of strings as the value. Once a field's value changes, any corresponding error in `errors` will be cleared from the field state.

```svelte title="Displaying errors returned by server-side validation"
<script lang="ts">
	import { Form, type FormErrors } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';

	async function submitToServer(/* payload */) {
		return {
			// @highlight-text "errors"
			errors: {
				promoCode: 'This promo code has expired'
			}
		};
	}

	// @highlight-text "errors"
	let errors = $state<FormErrors>({});
</script>

<Form
	// @highlight-text "errors"
	bind:errors
	onsubmit={async (event) => {
		event.preventDefault();
		const response = await submitToServer(/* data */);
		// @highlight-text "errors"
		errors = response.errors;
	}}
>
	<Field.Root name="promoCode" />
</Form>
```

With a SvelteKit [remote form](https://svelte.dev/docs/kit/remote-functions#form), pass it to `<Form form={...}>` instead, and each `<Field.Root name>` reads its own issues. [Use a SvelteKit remote form](/handbook/sveltekit#use-a-sveltekit-remote-form) has a complete example.

When using [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions) you can return server-side errors from `fail()` and pass the page's `form?.errors` to the `errors` prop. [Connect a form action](/handbook/sveltekit#connect-a-form-action) has a complete example.

```svelte title="Returning errors from a form action"
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { Form } from '@sveltery/base/form';
	import { Field } from '@sveltery/base/field';

	// @highlight-text "form"
	let { form } = $props();
</script>

<!-- @highlight-text "form" "errors" -->
<Form method="POST" errors={form?.errors}>
	<Field.Root name="password">
		<Field.Control />
		<Field.Error />
	</Field.Root>
</Form>
```

```ts
// src/routes/login/+page.server.ts
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const result = authenticateUser(await request.formData());

		if (!result.success) {
			return fail(400, {
				// @highlight-text "errors"
				errors: {
					password: 'Invalid username or password'
				}
			});
		}
		/* redirect on the server on success */
	}
};
```

## Displaying errors

Use `<Field.Error>` without `children` to automatically display the field's native error message when invalid. The `match` prop can be used to customize the message based on the validity state, and manage internationalization from your application logic:

```svelte title="Customizing error message for a required field"
<Field.Error match="valueMissing">You must create a username</Field.Error>
```

A `children` snippet receives the messages, so you can format them yourself:

```svelte title="Listing every message"
<Field.Error>
	{#snippet children(messages)}
		{#each messages as message (message)}<p>{message}</p>{/each}
	{/snippet}
</Field.Error>
```

Use `<Form.Error>` for messages that belong to the whole form and to no field: `errors['']`, or the issues a SvelteKit remote form holds with an empty path. A `<Field.Error>` outside any `<Field.Root>` renders nothing and warns in development.

## Superforms

[Superforms](https://superforms.rocks) is a popular SvelteKit library that you can integrate with Sveltery Base to externally manage form and field state for your existing components.

<DemoSuperforms />

### Initialize the form

Initialize the form with the `superForm` function, assigning the initial value of each field by their name in the data you pass to `defaults`:

```ts title="Initialize a form instance"
import { defaults, superForm } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

const schema = v.object({
	username: v.string(),
	email: v.string()
});

const { form, errors, tainted, isTainted, enhance } = superForm(
	defaults({ username: '', email: '' }, valibot(schema)),
	{ SPA: true }
);
```

`SPA: true` validates and submits in the browser. To validate on the server instead, pass the data that `superValidate` returns from your load function in place of `defaults`, as the Superforms docs describe.

### Integrate components

Bind each control to the `$form` store, and forward the field's state from `$errors` and `$tainted` to `<Field.Root>`:

```svelte title="Integrating Superforms with Sveltery Base field"
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field } from '@sveltery/base/field';

	// @highlight-text "form" "errors" "tainted" "isTainted"
	const { form, errors, tainted, isTainted } = superForm(/* ... */);
</script>

<!-- @highlight-text "invalid" "dirty" -->
<Field.Root name="username" invalid={!!$errors.username} dirty={isTainted($tainted?.username)}>
	<Field.Label>Username</Field.Label>
	<Field.Description>
		May appear where you contribute or are mentioned. You can remove it at any time.
	</Field.Description>
	<!-- @highlight-text "bind:value" -->
	<Field.Control placeholder="e.g. alice132" bind:value={$form.username} />
	<!-- @highlight-text "$errors" -->
	<Field.Error match={!!$errors.username}>
		<!-- @highlight-text "$errors" -->
		{$errors.username?.[0]}
	</Field.Error>
</Field.Root>
```

Superforms does not track whether a field was touched, so leave `touched` out, and `<Field.Root>` marks the field touched on blur. There is no ref to forward. `invalid` sets `aria-invalid` on the control and `data-invalid` on every part of the field.

### Field validation

Specify the validation rules in the schema, pass the schema's adapter to `validators`, and use the `match` prop to delegate control of the error rendering:

```svelte title="Defining validation rules and displaying errors"
<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import * as v from 'valibot';
	import { Field } from '@sveltery/base/field';

	const schema = v.object({
		// @highlight-start
		username: v.pipe(
			v.string(),
			v.nonEmpty('This is a required field'),
			v.minLength(2, 'Too short'),
			v.check((value) => isAllowed(value), 'Invalid')
		)
		// @highlight-end
	});
	const adapter = valibot(schema);

	const { form, errors, tainted, isTainted } = superForm(defaults(adapter), {
		SPA: true,
		validators: adapter
	});
</script>

<Field.Root name="username" invalid={!!$errors.username} dirty={isTainted($tainted?.username)}>
	<Field.Label>Username</Field.Label>
	<Field.Description>
		May appear where you contribute or are mentioned. You can remove it at any time.
	</Field.Description>
	<Field.Control placeholder="e.g. alice132" bind:value={$form.username} />
	<!-- @highlight-start -->
	<Field.Error match={!!$errors.username}>
		{$errors.username?.[0]}
	</Field.Error>
	<!-- @highlight-end -->
</Field.Root>
```

Keep `validators` when you also validate on the server. Superforms then clears a message as the user edits. Without them, a message from the server stays in `$errors` until the next submit.

### Submitting data

Attach the `enhance` action to `<Form>` with `fromAction`, and handle the validated values in the `onUpdate` callback:

```svelte title="Form submission handler"
<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { Form } from '@sveltery/base/form';

	const { enhance } = superForm(defaults(adapter), {
		SPA: true,
		validators: adapter,
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			// transform the object and/or submit it to a server
			await fetch(/* ... */);
		}
	});
</script>

<Form {@attach fromAction(enhance)} />
```

The browser's constraint check runs before Superforms sees the submit, so a control that fails `required` or a sync `validate` never reaches `onUpdate`. With `SPA: true`, Superforms validates the rest with the schema, and `form.valid` reflects only the schema. Without `SPA`, Superforms posts the form to your form action, so validate the data in the action with `superValidate`.

## TanStack Form

[TanStack Form](https://tanstack.com/form/latest/docs/overview) is a form library with a function-based API for orchestrating validations that can also be integrated with Sveltery Base.

<DemoTanstackForm />

### Initialize the form

Create a form instance with the `createForm` function, assigning the initial value of each field by their name in the `defaultValues` option:

```ts title="Initialize a form instance"
import { createForm } from '@tanstack/svelte-form';

interface FormValues {
	username: string;
	email: string;
}

const defaultValues: FormValues = {
	username: '',
	email: ''
};

// @highlight-start
/* createForm returns a form instance */
const form = createForm(() => ({
	// @highlight-end
	defaultValues
}));
```

### Integrate components

Use the `<form.Field>` component from the form instance to integrate with Sveltery Base components using the `children` snippet, forwarding the various `field` properties to the appropriate part:

```svelte title="Integrating TanStack Form with Sveltery Base components"
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Field } from '@sveltery/base/field';

	const form = createForm(/* defaultValues, other options */);
</script>

<form>
	<!-- @highlight-start -->
	<form.Field name="username">
		{#snippet children(field)}
			<!-- @highlight-end -->
			<Field.Root
				// @highlight-start
				// @highlight-text "field.name"
				name={field.name}
				// @highlight-text "isValid"
				invalid={!field.state.meta.isValid}
				// @highlight-text "isDirty"
				dirty={field.state.meta.isDirty}
				// @highlight-text "isTouched"
				touched={field.state.meta.isTouched}
				// @highlight-end
			>
				<Field.Label>Username</Field.Label>
				<Field.Control
					// @highlight-start
					// @highlight-text "field.state.value" "field.handleChange"
					bind:value={() => field.state.value, (value) => field.handleChange(value)}
					// @highlight-text "field.handleBlur"
					onblur={field.handleBlur}
					// @highlight-end
					placeholder="e.g. bob276"
				/>

				<!-- @highlight-start -->
				<!-- @highlight-text "isValid" -->
				<Field.Error match={!field.state.meta.isValid}>
					<!-- @highlight-end -->
					{field.state.meta.errors.join(',')}
				</Field.Error>
			</Field.Root>
		{/snippet}
	</form.Field>
</form>
```

The Sveltery Base `<Form>` component is not needed when using TanStack Form.

### Form validation

To configure a native `<form>`-like validation strategy:

1. Use the additional `revalidateLogic` function and pass it to `createForm`.
2. Pass a validation function to the `validators.onDynamic` option of `createForm` that returns an error object with keys corresponding to the field `name`s.

This validates all fields when the first submission is attempted, and revalidates any invalid fields when their values change again.

```ts title="Form-level validators"
// @highlight-text "revalidateLogic"
import { createForm, revalidateLogic } from '@tanstack/svelte-form';

const form = createForm(() => ({
	defaultValues: {
		username: '',
		email: ''
	},
	// @highlight-start
	// @highlight-text "revalidateLogic"
	validationLogic: revalidateLogic({
		// @highlight-end
		mode: 'submit',
		modeAfterSubmission: 'change'
	}),
	validators: {
		// @highlight-start
		// @highlight-text "onDynamic"
		onDynamic: ({ value: formValues }) => {
			// @highlight-end
			const errors: Record<string, string> = {};

			if (!formValues.username) {
				errors.username = 'Username is required.';
			} else if (formValues.username.length < 3) {
				errors.username = 'At least 3 characters.';
			}

			if (!formValues.email) {
				errors.email = 'Email is required.';
			} else if (!isValidEmail(formValues.email)) {
				errors.email = 'Invalid email address.';
			}

			return { form: errors, fields: errors };
		}
	}
}));
```

### Field validation

You can pass additional validator functions to individual `<form.Field>` components to add validations on top of the form-level validators:

```svelte title="Field-level validators"
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { Field } from '@sveltery/base/field';

	const form = createForm();
</script>

<form.Field
	name="username"
	// @highlight-start
	validators={{
		onChangeAsync: async ({ value: username }) => {
			const result = await fetch(/* check the availability of a username from an external API */);

			return result.success ? undefined : `${username} is not available.`;
		}
	}}
	// @highlight-end
>
	{#snippet children(field)}
		<Field.Root name={field.name} /* forward the field props */ />
	{/snippet}
</form.Field>
```

### Submitting data

To submit the form:

1. Pass a submit handler function to the `onSubmit` option of `createForm`.
2. Call `form.handleSubmit()` from an event handler such as form `onsubmit` or `onclick` on a button.

```svelte title="Form submission handler"
<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';

	const form = createForm(() => ({
		// @highlight-start
		onSubmit: async ({ value: formValues }) => {
			await fetch(/* POST the `formValues` to an external API */);
		}
		// @highlight-end
	}));
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		// @highlight-start
		// @highlight-text "form.handleSubmit()"
		form.handleSubmit();
		// @highlight-end
	}}
>
	<!-- form fields -->
	<!-- @highlight -->
	<button type="submit">Submit</button>
</form>
```
