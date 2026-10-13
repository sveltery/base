---
title: Number Field
description: A numeric input element with increment and decrement buttons, and a scrub area.
---

```svelte demo
<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';

	const button =
		'flex size-10 items-center justify-center border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
</script>

<NumberField.Root id="amount" defaultValue={100} class="flex flex-col items-start gap-1">
	<NumberField.ScrubArea class="cursor-ew-resize">
		<label for="amount" class="text-sm font-medium text-gray-900 dark:text-gray-100">Amount</label>
		<NumberField.ScrubAreaCursor class="drop-shadow-sm">
			<svg
				width="26"
				height="14"
				viewBox="0 0 24 14"
				fill="black"
				stroke="white"
				aria-hidden="true"
			>
				<path
					d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z"
				/>
			</svg>
		</NumberField.ScrubAreaCursor>
	</NumberField.ScrubArea>
	<NumberField.Group class="flex">
		<NumberField.Decrement class="{button} rounded-l-md" aria-label="Decrease">
			<svg
				width="10"
				height="10"
				viewBox="0 0 10 10"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				aria-hidden="true"
			>
				<path d="M0 5H10" />
			</svg>
		</NumberField.Decrement>
		<NumberField.Input
			class="h-10 w-24 border-y border-gray-200 bg-white text-center text-base text-gray-900 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
		/>
		<NumberField.Increment class="{button} rounded-r-md" aria-label="Increase">
			<svg
				width="10"
				height="10"
				viewBox="0 0 10 10"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				aria-hidden="true"
			>
				<path d="M0 5H10M5 0V10" />
			</svg>
		</NumberField.Increment>
	</NumberField.Group>
</NumberField.Root>
```

Drag the label sideways to scrub the value. Press the up and down arrow keys in the input, or hold a stepper button, to change it. Home and End jump to `min` and `max` when you set them.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';
</script>

<NumberField.Root>
	<NumberField.ScrubArea>
		<NumberField.ScrubAreaCursor />
	</NumberField.ScrubArea>
	<NumberField.Group>
		<NumberField.Decrement />
		<NumberField.Input />
		<NumberField.Increment />
	</NumberField.Group>
</NumberField.Root>
```

Form controls need an accessible name. Use a `<label>` whose `for` matches the root's `id`, or use [Field](/components/field) with `Field.Label`.

## Examples

### Bind the value

Bind `value` to read and change the number. The value is a `number`, or `null` when the input is empty. Without `bind:`, the field manages its own value, and `defaultValue` is the value an empty binding starts from.

```svelte demo
<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';

	let quantity = $state<number | null>(2);

	const button =
		'flex size-9 items-center justify-center border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<NumberField.Root
		id="quantity"
		bind:value={quantity}
		min={0}
		max={10}
		class="flex flex-col items-start gap-1"
	>
		<label for="quantity" class="font-medium">Quantity</label>
		<NumberField.Group class="flex">
			<NumberField.Decrement class="{button} rounded-l-md" aria-label="Decrease"
				>−</NumberField.Decrement
			>
			<NumberField.Input
				class="h-9 w-20 border-y border-gray-200 bg-white text-center text-base tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
			/>
			<NumberField.Increment class="{button} rounded-r-md" aria-label="Increase"
				>+</NumberField.Increment
			>
		</NumberField.Group>
	</NumberField.Root>
	<p>Quantity: {quantity ?? 'empty'}</p>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (quantity = 5)}
	>
		Set to 5
	</button>
</div>
```

### Range and step

`min` and `max` clamp the value. `step` sets how much the buttons, the arrow keys, and scrubbing change it. Hold Shift to step by `largeStep` (10 by default). Hold Alt to step by `smallStep` (0.1 by default). Set `snapOnStep` to snap the value to a multiple of the active step, and `allowOutOfRange` to let the user type a value outside `min` and `max` so native range validation can flag it.

```svelte
<NumberField.Root min={0} max={100} step={5} largeStep={25} snapOnStep>…</NumberField.Root>
```

### Format the value

`format` takes `Intl.NumberFormatOptions`, and `locale` takes the locale to format and parse with. The field formats the shown text and parses typed text with the same rules. The `value` stays a plain number.

```svelte demo
<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';

	let price = $state<number | null>(19.99);
	let locale = $state('en-US');

	const button =
		'flex size-9 items-center justify-center border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		Locale
		<select
			bind:value={locale}
			class="rounded-md border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
		>
			<option value="en-US">en-US</option>
			<option value="de-DE">de-DE</option>
			<option value="fr-FR">fr-FR</option>
		</select>
	</label>
	<NumberField.Root
		id="price"
		bind:value={price}
		min={0}
		step={0.01}
		{locale}
		format={{ style: 'currency', currency: 'EUR' }}
		class="flex flex-col items-start gap-1"
	>
		<label for="price" class="font-medium">Price</label>
		<NumberField.Group class="flex">
			<NumberField.Decrement class="{button} rounded-l-md" aria-label="Decrease"
				>−</NumberField.Decrement
			>
			<NumberField.Input
				class="h-9 w-28 border-y border-gray-200 bg-white text-center text-base tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
			/>
			<NumberField.Increment class="{button} rounded-r-md" aria-label="Increase"
				>+</NumberField.Increment
			>
		</NumberField.Group>
	</NumberField.Root>
	<p>Value: {price ?? 'empty'}</p>
</div>
```

### Use with a field

Wrap the number field in a `Field.Root` to add a label, a description, and validation. The field links the label to the input and publishes its validity as data attributes. Use `required` for native validation and `validate` for rules such as a range. With `allowOutOfRange`, the user can type a value outside `min` and `max`, and `validate` can report it.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { NumberField } from '@sveltery/base/number-field';

	const button =
		'flex size-9 items-center justify-center border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
</script>

<Field.Root
	name="guests"
	validationMode="onBlur"
	validate={(value) =>
		typeof value === 'number' && (value < 1 || value > 8) ? 'Choose between 1 and 8 guests.' : null}
	class="flex flex-col items-start gap-1"
>
	<NumberField.Root
		required
		min={1}
		max={8}
		allowOutOfRange
		class="flex flex-col items-start gap-1"
	>
		<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Guests</Field.Label>
		<NumberField.Group class="flex">
			<NumberField.Decrement class="{button} rounded-l-md" aria-label="Decrease"
				>−</NumberField.Decrement
			>
			<NumberField.Input
				class="h-9 w-20 border-y border-gray-200 bg-white text-center text-base text-gray-900 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
			/>
			<NumberField.Increment class="{button} rounded-r-md" aria-label="Increase"
				>+</NumberField.Increment
			>
		</NumberField.Group>
	</NumberField.Root>
	<Field.Error class="text-sm text-red-700 dark:text-red-400" />
	<Field.Description class="text-sm text-gray-600 dark:text-gray-400">
		Between 1 and 8. Type 12 and leave the input to see an error.
	</Field.Description>
</Field.Root>
```

### React to changes

`onValueChange` runs on every change and `onValueCommitted` runs when the user finishes. The commit happens on blur after typing, when a scrub or a held button press ends, and at once for keyboard and wheel changes. `eventDetails.reason` says what triggered a change. `eventDetails.cancel()` in `onValueChange` rejects it.

```svelte
<NumberField.Root
	onValueChange={(value, eventDetails) => {
		if (eventDetails.reason === 'wheel') eventDetails.cancel();
	}}
	onValueCommitted={(value) => save(value)}
>
	…
</NumberField.Root>
```

### Wheel scrubbing

Set `allowWheelScrub` to let the mouse wheel change the value while the input has focus.

```svelte
<NumberField.Root allowWheelScrub>…</NumberField.Root>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. `defaultValue` stays, because Number Field is a form control. It is the value an empty binding starts from, and the value a form reset restores. A reset calls no change callback.
- `onValueChange` and `onValueCommitted` run before the state changes. Call `eventDetails.cancel()` in `onValueChange` to keep the current value.
- There is no `inputRef` prop yet.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names such as `onclick`. `readonly`, `autocomplete`, and `inputmode` use the HTML spelling, so the root takes `readonly`, not `readOnly`.
- The root renders a visually hidden number input that carries `name`, `form`, `min`, `max`, `step`, and the value for form submission. It fires a bubbling `input` event when the user changes the value, and a `change` event when the change is committed.

## API reference

Every part sets the attributes in the table under Root, except where the part says otherwise.

### Root

<ApiPart name="number-field" part="Root" />

| Attribute        | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `data-disabled`  | Present when the field is disabled.                                     |
| `data-readonly`  | Present when the field is read-only.                                    |
| `data-required`  | Present when the field is required.                                     |
| `data-scrubbing` | Present while the user scrubs the value.                                |
| `data-valid`     | Present when the field is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`   | Present when the field is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`     | Present when the value has changed. Needs a `Field.Root` ancestor.      |
| `data-touched`   | Present when the field has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`    | Present when the field has a value. Needs a `Field.Root` ancestor.      |
| `data-focused`   | Present when the input is focused. Needs a `Field.Root` ancestor.       |

### ScrubArea

<ApiPart name="number-field" part="ScrubArea" />

`ScrubArea` sets the same attributes as `Root`.

### ScrubAreaCursor

<ApiPart name="number-field" part="ScrubAreaCursor" />

`ScrubAreaCursor` sets the same attributes as `Root`. It renders only while the user scrubs. It moves to `document.body`, and it does not render in WebKit browsers, on touch input, or when the browser denies pointer lock.

### Group

<ApiPart name="number-field" part="Group" />

`Group` sets the same attributes as `Root`.

### Decrement

<ApiPart name="number-field" part="Decrement" />

`Decrement` sets the same attributes as `Root`. Its `data-disabled` is also present when the value is at the minimum or when you set `disabled` on the button.

### Input

<ApiPart name="number-field" part="Input" />

`Input` sets the same attributes as `Root`.

### Increment

<ApiPart name="number-field" part="Increment" />

`Increment` sets the same attributes as `Root`. Its `data-disabled` is also present when the value is at the maximum or when you set `disabled` on the button.
