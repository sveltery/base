---
title: Input
description: A native input element that automatically works with Field.
---

```svelte demo
<script lang="ts">
	import { Input } from '@sveltery/base/input';
</script>

<label
	class="flex w-64 flex-col items-start gap-1 text-sm font-medium text-gray-900 dark:text-gray-100"
>
	Name
	<Input
		placeholder="e.g. Colm Tuite"
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
</label>
```

## Anatomy

Import the component and render it:

```svelte
<script lang="ts">
	import { Input } from '@sveltery/base/input';
</script>

<Input />
```

`Input` is `Field.Control` under another name. It renders an `<input>` and takes the same props. Outside a [Field](/components/field) it behaves like a plain input. Inside a `Field.Root`, it joins the field's labeling, dirty and touched tracking, and validation.

Form controls need an accessible name. Wrap the input in a `<label>`, or use `Field.Label` inside a `Field.Root`.

## Examples

### Bind the value

Bind `value` to read and change the text. Without `bind:`, the input manages its own text. `defaultValue` is the value an empty binding starts from, as on an HTML input. A form reset restores it.

```svelte demo
<script lang="ts">
	import { Input } from '@sveltery/base/input';

	let value = $state('');
</script>

<div class="flex w-64 flex-col items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex w-full flex-col items-start gap-1 font-medium">
		Nickname
		<Input
			bind:value
			placeholder="Pick a nickname"
			class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
		/>
	</label>
	<p>{value === '' ? 'Nothing typed yet.' : `Hello, ${value}.`}</p>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (value = '')}
	>
		Clear
	</button>
</div>
```

### Veto a change

`onValueChange` runs before the value is written. Call `eventDetails.cancel()` to reject the edit. The input returns to the value it held before.

```svelte demo
<script lang="ts">
	import { Input } from '@sveltery/base/input';
</script>

<label
	class="flex w-64 flex-col items-start gap-1 text-sm font-medium text-gray-900 dark:text-gray-100"
>
	Zip code (digits only)
	<Input
		inputmode="numeric"
		onValueChange={(value, eventDetails) => {
			if (/\D/.test(value)) eventDetails.cancel();
		}}
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
</label>
```

### Use inside a field

Put the input in a `Field.Root` to give it a label, a description, and validation. The input then publishes `data-invalid`, `data-dirty`, `data-touched`, and the other field attributes. In the demo, type `a` and leave the input to see the format error.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Input } from '@sveltery/base/input';
</script>

<Field.Root class="flex w-64 flex-col items-start gap-1" validationMode="onBlur">
	<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Email</Field.Label>
	<Input
		type="email"
		required
		placeholder="you@example.com"
		class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
	<Field.Error match="valueMissing" class="text-sm text-red-700 dark:text-red-400">
		Enter your email.
	</Field.Error>
	<Field.Error match="typeMismatch" class="text-sm text-red-700 dark:text-red-400">
		Enter a valid email address.
	</Field.Error>
</Field.Root>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. `defaultValue` stays, because `Input` is a form control. It is the value an empty binding starts from, and the value a form reset restores.
- `onValueChange` runs before the value is written. Call `eventDetails.cancel()` to reject the edit. The input then returns to the held value. Upstream keeps the typed text in an uncontrolled input.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names such as `oninput` and `onfocus`. `readonly`, `autocomplete`, and `inputmode` use the HTML spelling.
- A form reset puts the input back to its `defaultValue` and updates the binding. The reset does not call `onValueChange`.

## API reference

### Input

<ApiPart name="input" part="Input" />

The data attributes need a `Field.Root` ancestor, except `data-disabled`.

| Attribute       | Description                              |
| --------------- | ---------------------------------------- |
| `data-disabled` | Present when the input is disabled.      |
| `data-valid`    | Present when the field is valid.         |
| `data-invalid`  | Present when the field is invalid.       |
| `data-dirty`    | Present when the value has changed.      |
| `data-touched`  | Present when the field has been touched. |
| `data-filled`   | Present when the input has a value.      |
| `data-focused`  | Present when the input has focus.        |
