---
title: Field
description: A component that provides labeling and validation for form controls.
---

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root class="flex w-64 flex-col items-start gap-1">
	<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Name</Field.Label>
	<Field.Control
		required
		placeholder="Required"
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
	<Field.Error match="valueMissing" class="text-sm text-red-700 dark:text-red-400">
		Please enter your name
	</Field.Error>
	<Field.Description class="text-sm text-gray-600 dark:text-gray-400">
		Visible on your profile
	</Field.Description>
</Field.Root>
```

Type a letter, delete it, and press Enter to see the error. A field reports a missing value only after its value has changed or its form has submitted. Outside a `Form`, a field in the default `onSubmit` mode validates when you press Enter. Inside a `Form`, it validates on submit.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root>
	<Field.Label />
	<Field.Control />
	<Field.Description />
	<Field.Error />
	<Field.Validity>
		{#snippet children(validity)}…{/snippet}
	</Field.Validity>
	<Field.Item />
</Field.Root>
```

`Field.Root` owns the state. `Field.Label`, `Field.Description`, and `Field.Error` link themselves to the control with `for`, `aria-labelledby`, and `aria-describedby`, so you pass no ids. `Field.Control` is a native `<input>`. The [Input](/components/input) component is the same part under another name.

`Field` also works with other form controls. [Checkbox](/components/checkbox), [Switch](/components/switch), [Radio Group](/components/radio-group), [Slider](/components/slider), [Number Field](/components/number-field), and [OTP Field](/components/otp-field) register with the nearest `Field.Root` the same way. Wrap a set of fields in a [Form](/components/form) to validate them together on submit. [Forms](/handbook/forms) is the guide to validation, server errors, and form sources.

## Examples

### Custom validation

Pass `validate` to `Field.Root` to add your own rules to the browser's constraint validation. The function receives the control's value and the values of every named field in the form. Return a message, an array of messages, or `null` for a valid value. `Field.Error` shows the message.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';

	function validateUsername(value: unknown) {
		const name = String(value);
		if (name.length < 3) return 'Use at least 3 characters.';
		if (name.toLowerCase() === 'admin') return 'That username is taken.';
		return null;
	}
</script>

<Field.Root
	name="username"
	validate={validateUsername}
	class="flex w-64 flex-col items-start gap-1"
>
	<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Username</Field.Label>
	<Field.Control
		placeholder="Try “admin”"
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
	<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	<Field.Description class="text-sm text-gray-600 dark:text-gray-400">
		Press Enter to validate.
	</Field.Description>
</Field.Root>
```

`validate` can be asynchronous. An async result updates the field when it settles, but it does not block a form submission.

### Validation mode

`validationMode` decides when the field validates:

- `onSubmit` validates when the form submits. After the first submit, the field revalidates on every change. This is the default.
- `onBlur` validates when the control loses focus.
- `onChange` validates on every change.

A `validationMode` on `Field.Root` takes precedence over the one on `Form`. With `onChange`, set `validationDebounceTime` to wait that many milliseconds between `validate` calls.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root
	validationMode="onChange"
	validationDebounceTime={300}
	validate={(value) => (String(value).length < 8 ? 'Use at least 8 characters.' : null)}
	class="flex w-64 flex-col items-start gap-1"
>
	<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Password</Field.Label>
	<Field.Control
		type="password"
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 data-[valid]:border-green-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
	<Field.Error class="text-sm text-red-700 dark:text-red-400" />
</Field.Root>
```

### Match a validity error

`Field.Error` takes a `match` prop. Pass a `ValidityState` key such as `valueMissing`, `typeMismatch`, `patternMismatch`, or `customError` to show that message only for that flag. Pass `true` to always show the error. Without `match`, the error shows when the field is invalid and displays the message from `validate`, from an `errors` prop on `Form`, or from the browser.

```svelte
<Field.Root>
	<Field.Label>Website</Field.Label>
	<Field.Control type="url" required />
	<Field.Error match="valueMissing">Enter a website.</Field.Error>
	<Field.Error match="typeMismatch">Enter a full URL, such as https://example.com.</Field.Error>
</Field.Root>
```

When the message is an array of several messages, `Field.Error` renders them as a list. Pass children to replace the message.

### Read the validity state

`Field.Validity` passes the field's validity to a children snippet. Use it to render custom feedback. The state has `validity` (the `ValidityState` flags, plus `valid`), `error`, `errors`, `value`, `initialValue`, and `transitionStatus`.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root
	validationMode="onChange"
	validate={(value) => (/\d/.test(String(value)) ? null : 'Include a number.')}
	class="flex w-64 flex-col items-start gap-1"
>
	<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Passphrase</Field.Label>
	<Field.Control
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
	<Field.Validity>
		{#snippet children(state)}
			<p class="text-sm text-gray-600 dark:text-gray-400">
				{#if state.validity.valid === null}
					Not checked yet.
				{:else if state.validity.valid}
					Looks good.
				{:else}
					{state.error}
				{/if}
			</p>
		{/snippet}
	</Field.Validity>
</Field.Root>
```

### Group choice controls

`Field.Item` gives each checkbox or radio in a group its own label and description, and it can disable one item without disabling the group. Put the group in a `Field.Root` so it takes the field's `name` and validation.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';

	let plan = $state('team');
</script>

<Field.Root name="plan" class="flex flex-col items-start gap-2">
	<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Plan</Field.Label>
	<RadioGroup
		bind:value={plan}
		class="flex flex-col items-start gap-1.5 text-gray-900 dark:text-gray-100"
	>
		{#each [{ value: 'solo', label: 'Solo' }, { value: 'team', label: 'Team' }, { value: 'enterprise', label: 'Enterprise', disabled: true }] as option (option.value)}
			<Field.Item disabled={option.disabled} class="data-[disabled]:opacity-50">
				<Field.Label class="flex items-center gap-2 text-sm">
					<Radio.Root
						value={option.value}
						class="flex size-5 items-center justify-center rounded-full border border-gray-300 bg-white focus-visible:outline-2 focus-visible:outline-blue-800 data-[checked]:border-gray-900 data-[checked]:bg-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:data-[checked]:border-gray-100 dark:data-[checked]:bg-gray-100"
					>
						<Radio.Indicator class="size-2 rounded-full bg-white dark:bg-gray-900" />
					</Radio.Root>
					{option.label}
				</Field.Label>
			</Field.Item>
		{/each}
	</RadioGroup>
	<p class="text-sm text-gray-600 dark:text-gray-400">Selected: {plan}</p>
</Field.Root>
```

### Bind to a form source

`field` takes a field of a form source, such as `f.fields.email` from a SvelteKit remote form or from `actionForm()`. The field's issues show in `Field.Error`, and its touched and dirty state sets `data-touched` and `data-dirty`. `Field.Control` takes the field's encoded name and its value, so set neither on the control.

`type` is the input type of the control. TypeScript checks it against the field's value. It is optional when a text input fits, as for a string, and required otherwise, as for a number or a boolean:

```svelte
<Form form={f}>
	<Field.Root field={f.fields.email} type="email">
		<Field.Label>Email</Field.Label>
		<Field.Control required />
		<Field.Error />
	</Field.Root>
	<Field.Root field={f.fields.age} type="number">
		<Field.Label>Age</Field.Label>
		<Field.Control />
		<Field.Error />
	</Field.Root>
	<Field.Root field={f.fields.newsletter} type="switch">
		<Field.Label><Switch.Root /> Send me the newsletter</Field.Label>
	</Field.Root>
</Form>
```

A composite control, such as Checkbox, Switch, Radio Group, Checkbox Group, Number Field, Slider, or OTP Field, binds through the `Field.Root` around it. Give the root the type that the control submits as, such as `switch` for a Switch and `range` for a Slider. In development, a control that does not match `type` logs an error.

Inside a Form with a `form` source, `<Field.Root name="email">` binds to the source's `email` field. TypeScript does not check that name, and in development Form warns when an issue has no field to show it. For a TanStack Form field, pass `tanstackField(field)` from `@sveltery/base/form/tanstack`. [Forms](/handbook/forms#bind-a-sveltekit-remote-form) has the full examples.

### Control the field state

`invalid`, `dirty`, and `touched` on `Field.Root` override the state that the field tracks. Use them when another library owns validation. Call `validate()` on the root, which you reach with `bind:this`, to validate on demand.

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';

	import type { FieldRootActions } from '@sveltery/base/field';

	let field = $state<FieldRootActions>();
	let serverError = $state('');
</script>

<Field.Root bind:this={field} invalid={Boolean(serverError)}>…</Field.Root>
<button type="button" onclick={() => field?.validate()}>Check</button>
```

## Differences from Base UI

- `Field.Control` keeps `defaultValue`, because it is a form control. `Field.Control` has `value` as a bindable prop instead of `value` and `onValueChange` together. `defaultValue` is the value an empty binding starts from, and the value a form reset restores. A reset also clears the field's dirty, touched, and validity state.
- `onValueChange` on `Field.Control` runs before the value is written. Call `eventDetails.cancel()` to reject the edit. The input then returns to the held value. Upstream keeps the typed text in an uncontrolled input.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Field.Error` passes the message as `children` when you give it none. `Field.Error` passes `undefined` when there is no message and you pass no children.
- `Field.Validity` takes a children snippet. React uses a function child.
- Upstream takes an `actionsRef` prop. In Svelte, use `bind:this` on `Field.Root` and call `validate()`.
- The `name` on `Field.Root` takes precedence over the `name` on the control.
- `field` and `type` on `Field.Root` have no upstream counterpart. They bind the field to a form source.
- Checkbox, Switch, Radio Group, and Checkbox Group register with the field the same way upstream does. A radio group is named by `aria-labelledby`, so every radio keeps its own id. A radio inside a `Field.Item` is labeled by that item's `Field.Label`.
- A Checkbox Group reports its whole value to `validate` and `onFormSubmit`. Upstream drops the values of disabled checkboxes and of checkboxes that belong to another form.
- Handlers use lowercase names such as `oninput`. `readonly`, `autocomplete`, and `inputmode` use the HTML spelling.

## API reference

The attribute tables below apply to `Root`, `Label`, `Control`, `Description`, `Item`, and `Error`, unless a part says otherwise.

### Root

<ApiPart name="field" part="Root" />

| Attribute       | Description                              |
| --------------- | ---------------------------------------- |
| `data-disabled` | Present when the field is disabled.      |
| `data-valid`    | Present when the field is valid.         |
| `data-invalid`  | Present when the field is invalid.       |
| `data-dirty`    | Present when the value has changed.      |
| `data-touched`  | Present when the field has been touched. |
| `data-filled`   | Present when the field has a value.      |
| `data-focused`  | Present when the control is focused.     |

### Label

<ApiPart name="field" part="Label" />

`Label` sets the same attributes as `Root`.

### Control

<ApiPart name="field" part="Control" />

`Control` sets the same attributes as `Root`.

### Description

<ApiPart name="field" part="Description" />

`Description` sets the same attributes as `Root`.

### Error

<ApiPart name="field" part="Error" />

`Error` sets the same attributes as `Root`, plus these:

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-starting-style` | Present when the error begins animating in. |
| `data-ending-style`   | Present when the error is animating out.    |

### Item

<ApiPart name="field" part="Item" />

`Item` sets the same attributes as `Root`.

### Validity

<ApiPart name="field" part="Validity" />

`Validity` renders no element and sets no attributes.
