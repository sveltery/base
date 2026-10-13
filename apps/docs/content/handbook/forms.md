---
title: Forms
description: A guide to building forms with Sveltery Base components.
order: 4
---

The form components build on the browser's [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api). [Form](/components/form), [Field](/components/field), and [Fieldset](/components/fieldset) collect values, validate them, show errors, and focus the first invalid control. The controls work with `bind:value`, with native form submission, and with form libraries that own the state themselves.

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

## Submit data

Form renders a native `<form>`, so a plain `action` and `method` submit the way HTML does. To handle the submit in your code, use `onsubmit` or `onFormSubmit`:

- `onsubmit` is the native submit event handler. It runs only when no field blocks the submit. Call `event.preventDefault()` to stop the browser from navigating.
- `onFormSubmit` receives the value of each named field as an object, with the event details as the second argument. Form calls `preventDefault()` on the native event for you.

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
- `minlength` and `maxlength` limit the length of a text value.
- `pattern` is a regular expression that the value must match.
- `min`, `max`, and `step` limit a numeric value.

Form turns off the browser's own validation bubbles once the page is hydrated, and shows the messages in `Field.Error` instead. Before hydration, or with JavaScript off, the browser validates as usual. A submit button with `formnovalidate` skips validation, as it does in HTML.

Controls such as Checkbox, Switch, Radio Group, Slider, and Number Field submit through a hidden native input. Give the field a `name` so that the input takes part in submission and validation.

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

In SvelteKit, return the errors from a form action. [SvelteKit](/handbook/sveltekit) has a complete example.

## Display errors

`Field.Error` without children shows the field's current message: the browser's message for a failed constraint, the result of `validate`, or the server error. Several messages render as a list.

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

## Reset

A `<button type="reset">` in the form resets it, as in HTML. Each control returns to its `defaultValue` or `defaultChecked`, and a bound value follows. Each field clears its dirty, touched, and validity state, and Form clears its `errors`.

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
