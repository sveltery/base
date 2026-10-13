---
title: OTP Field
description: A one-time password input composed of individual character slots.
---

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
</script>

<div class="flex flex-col items-start gap-2">
	<label for="verification" class="text-sm font-medium text-gray-900 dark:text-gray-100">
		Verification code
	</label>
	<OTPField.Root
		id="verification"
		length={6}
		aria-describedby="verification-hint"
		class="flex gap-2"
	>
		{#each { length: 6 } as _, index (index)}
			<OTPField.Input
				aria-label="Character {index + 1} of 6"
				class="size-11 rounded-md border border-gray-200 bg-white text-center text-lg text-gray-900 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[filled]:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
			/>
		{/each}
	</OTPField.Root>
	<p id="verification-hint" class="text-sm text-gray-600 dark:text-gray-400">
		Enter the 6-digit code we sent to your phone.
	</p>
</div>
```

Type digits, or paste a whole code into any slot. Backspace and the arrow keys move between slots.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
</script>

<OTPField.Root length={6}>
	<OTPField.Input />
	<OTPField.Separator />
</OTPField.Root>
```

`length` is required. Render exactly that many `OTPField.Input` parts. The root warns in development when the numbers differ. The root renders a `<div>` with `role="group"` and a visually hidden input that carries the whole code for form submission and native validation.

Form controls need an accessible name. Point a `<label for>` at the root's `id`, which names the first slot, or use [Field](/components/field) with `Field.Label`. Give each later slot an `aria-label` such as "Character 2 of 6". The first slot ignores `aria-label` and takes the label of the field.

## Examples

### Bind the value

Bind `value` to read and change the code. Without `bind:`, the field manages its own value, and `defaultValue` is the value an empty binding starts from. `onValueComplete` runs when the last slot fills.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	let code = $state('');
	let completed = $state('');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label for="bound-code" class="font-medium">PIN</label>
	<OTPField.Root
		id="bound-code"
		bind:value={code}
		length={4}
		onValueComplete={(value) => (completed = value)}
		class="flex gap-2"
	>
		{#each { length: 4 } as _, index (index)}
			<OTPField.Input
				aria-label="Character {index + 1} of 4"
				class="size-11 rounded-md border border-gray-200 bg-white text-center text-lg tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
			/>
		{/each}
	</OTPField.Root>
	<p>Value: {code === '' ? 'empty' : code}</p>
	<p>Completed: {completed === '' ? 'not yet' : completed}</p>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => {
			code = '';
			completed = '';
		}}
	>
		Clear
	</button>
</div>
```

### Use in a form

Wrap the OTP field in a `Field.Root` and a `Form` for label association, a `name`, and validation. Set `autoSubmit` to submit the owning form when every slot is filled. Use `onValueComplete` instead to react to a full code without submitting.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { OTPField } from '@sveltery/base/otp-field';

	let verified = $state('');
</script>

<Form onFormSubmit={(values) => (verified = String(values.code))} class="flex flex-col gap-3">
	<Field.Root name="code" class="flex flex-col items-start gap-2">
		<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">
			Verification code
		</Field.Label>
		<OTPField.Root length={6} autoSubmit required class="flex gap-2">
			{#each { length: 6 } as _, index (index)}
				<OTPField.Input
					aria-label="Character {index + 1} of 6"
					class="size-11 rounded-md border border-gray-200 bg-white text-center text-lg text-gray-900 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
				/>
			{/each}
		</OTPField.Root>
		<Field.Description class="text-sm text-gray-600 dark:text-gray-400">
			The form submits when you fill the sixth slot.
		</Field.Description>
		<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	</Field.Root>
	{#if verified}
		<p class="text-sm text-green-700 dark:text-green-400">Submitted {verified}</p>
	{/if}
</Form>
```

### Alphanumeric codes

`validationType` sets which characters the field accepts. It is `numeric` by default. Use `alpha` for letters, `alphanumeric` for letters and digits, and `none` to accept any character. The type also sets the virtual keyboard through `inputmode`, unless you pass `inputmode` yourself.

```svelte
<OTPField.Root length={6} validationType="alphanumeric">…</OTPField.Root>
```

### Grouped layout

Wrap subsets of inputs in your own elements and add `OTPField.Separator` between them. The separator is a `role="separator"` element.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const slot =
		'size-11 border border-gray-200 bg-white text-center text-lg text-gray-900 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 first:rounded-l-md last:rounded-r-md not-first:-ml-px';
</script>

<div class="flex flex-col items-start gap-2">
	<label for="grouped" class="text-sm font-medium text-gray-900 dark:text-gray-100">
		Verification code
	</label>
	<OTPField.Root id="grouped" length={6} class="flex items-center gap-3">
		<div class="flex">
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input aria-label="Character {index + 1} of 6" class={slot} />
			{/each}
		</div>
		<OTPField.Separator orientation="vertical" class="h-6 w-px bg-gray-400 dark:bg-gray-500" />
		<div class="flex">
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input aria-label="Character {index + 4} of 6" class={slot} />
			{/each}
		</div>
	</OTPField.Root>
</div>
```

### Placeholder hints

Each slot is a real input, so the native `placeholder` attribute and CSS work. Hide the hint while the slot has focus with `placeholder:` and `focus:` variants.

```svelte
<OTPField.Input placeholder="•" class="focus:placeholder-transparent" />
```

### Normalize the value

`normalizeValue` rewrites the value after whitespace removal and `validationType` filtering. The result is filtered again and then clamped to `length`. The function should be idempotent. Use `validationType="none"` when the normalizer defines the whole rule. `onValueInvalid` runs when typed or pasted text contains characters the field rejects.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	let message = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	function flash() {
		message = 'Use letters and digits only.';
		clearTimeout(timer);
		timer = setTimeout(() => (message = ''), 2000);
	}
</script>

<div class="flex flex-col items-start gap-2">
	<label for="recovery" class="text-sm font-medium text-gray-900 dark:text-gray-100">
		Recovery code
	</label>
	<OTPField.Root
		id="recovery"
		length={6}
		validationType="alphanumeric"
		normalizeValue={(value) => value.toUpperCase()}
		onValueInvalid={flash}
		class="flex gap-2"
	>
		{#each { length: 6 } as _, index (index)}
			<OTPField.Input
				aria-label="Character {index + 1} of 6"
				class="size-11 rounded-md border border-gray-200 bg-white text-center text-lg text-gray-900 uppercase focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
			/>
		{/each}
	</OTPField.Root>
	<p role="status" class="min-h-5 text-sm text-gray-600 dark:text-gray-400">{message}</p>
</div>
```

### Masked entry

Set `mask` to render the slots as password inputs. A `type` on one `OTPField.Input` overrides the root for that slot.

```svelte
<OTPField.Root length={6} mask>…</OTPField.Root>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. `defaultValue` stays, because OTP Field is a form control. It is the value an empty binding starts from, and the value a form reset restores. A reset calls no change callback.
- `onValueChange` runs before the value is written. Call `eventDetails.cancel()` to reject the change. `eventDetails.reason` is `input-change`, `input-clear`, `input-paste`, or `keyboard`.
- There is no `inputRef` prop yet. The React controlled-value lock is not ported. A parent that rejects a change through `bind:value={get, set}` keeps its value.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names such as `oninput` and `onpaste`. `readonly`, `autocomplete`, and `inputmode` use the HTML spelling.
- Text direction comes from the CSS `direction` of each input. Arrow keys follow it.
- The hidden validation input fires a bubbling `input` event when the user changes the code, and a `change` event when focus leaves the field, so a plain listener on the form sees the change.

## API reference

### Root

<ApiPart name="otp-field" part="Root" />

| Attribute       | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `data-disabled` | Present when the field is disabled.                                     |
| `data-readonly` | Present when the field is read-only.                                    |
| `data-required` | Present when the field is required.                                     |
| `data-complete` | Present when every slot is filled.                                      |
| `data-filled`   | Present when the field has at least one character.                      |
| `data-focused`  | Present when one of the inputs is focused.                              |
| `data-valid`    | Present when the field is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`  | Present when the field is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`    | Present when the value has changed. Needs a `Field.Root` ancestor.      |
| `data-touched`  | Present when the field has been touched. Needs a `Field.Root` ancestor. |

### Input

<ApiPart name="otp-field" part="Input" />

| Attribute       | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `data-disabled` | Present when the field is disabled.                                     |
| `data-readonly` | Present when the field is read-only.                                    |
| `data-required` | Present when the field is required.                                     |
| `data-complete` | Present when every slot is filled.                                      |
| `data-filled`   | Present when this input contains a character.                           |
| `data-focused`  | Present when any input in the field is focused.                         |
| `data-valid`    | Present when the field is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`  | Present when the field is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`    | Present when the value has changed. Needs a `Field.Root` ancestor.      |
| `data-touched`  | Present when the field has been touched. Needs a `Field.Root` ancestor. |

### Separator

<ApiPart name="otp-field" part="Separator" />

| Attribute          | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `data-orientation` | The separator's orientation, `horizontal` or `vertical`. |
