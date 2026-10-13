---
title: Radio Group
description: Provides shared state to a series of radio buttons.
---

```svelte demo
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
</script>

<RadioGroup
	aria-labelledby="storage-type"
	defaultValue="ssd"
	class="flex flex-col items-start gap-1 text-gray-900 dark:text-gray-100"
>
	<div class="font-medium" id="storage-type">Storage type</div>
	<label class="flex items-center gap-2">
		<Radio.Root
			value="ssd"
			class="flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Radio.Indicator
				class="flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900"
			/>
		</Radio.Root>
		SSD
	</label>
	<label class="flex items-center gap-2">
		<Radio.Root
			value="hdd"
			class="flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Radio.Indicator
				class="flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900"
			/>
		</Radio.Root>
		HDD
	</label>
	<label class="flex items-center gap-2">
		<Radio.Root
			value="nvme"
			class="flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Radio.Indicator
				class="flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900"
			/>
		</Radio.Root>
		NVMe
	</label>
</RadioGroup>
```

## Anatomy

Import the group and `Radio`, then place radios inside the group. The group and the radios come from two imports, `@sveltery/base/radio-group` and `@sveltery/base/radio`:

```svelte
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
</script>

<RadioGroup>
	<Radio.Root>
		<Radio.Indicator />
	</Radio.Root>
</RadioGroup>
```

## Examples

### Labeling

A group needs an accessible name. Point `aria-labelledby` at a sibling caption, as the demo above does. Name each radio with an enclosing `<label>`.

### Value

Bind `value` to read and change the selected radio. Without `bind:`, the group manages its own state. Use `defaultValue` to set the initial selection of an unbound group.

A radio's `value` can be any type, such as a number. Compare values with `===`. Store an object value with `$state.raw`, so the group and the radios see the same reference.

```svelte demo
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';

	const sizes = [
		{ value: 1, label: 'Small' },
		{ value: 2, label: 'Medium' },
		{ value: 3, label: 'Large' }
	];
	let size = $state<number>(2);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<RadioGroup bind:value={size} aria-label="Size" class="flex flex-col items-start gap-1">
		{#each sizes as option (option.value)}
			<label class="flex items-center gap-2">
				<Radio.Root
					value={option.value}
					class="flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
				>
					<Radio.Indicator
						class="flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900"
					/>
				</Radio.Root>
				{option.label}
			</label>
		{/each}
	</RadioGroup>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (size = 3)}
	>
		Choose Large
	</button>
	<p>Selected size: {size}</p>
</div>
```

To veto a change, call `eventDetails.cancel()` in `onValueChange`. The group then keeps its current value.

### Keyboard

The group is one tab stop. Tab moves focus to the selected radio, or to the first radio when none is selected. The arrow keys move focus to the next or previous radio and select it. Space selects the focused radio. Enter does not select a radio.

### Native button

`Radio.Root` renders a `<span>` and a hidden `<input>` by default. To use a sibling `<label for>`, set `nativeButton` and render a `<button>` with the `render` snippet. The `id` then goes on the button, so the label points at it.

```svelte demo
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
</script>

<RadioGroup
	aria-labelledby="native-storage-type"
	defaultValue="ssd"
	class="flex flex-col items-start gap-1 text-gray-900 dark:text-gray-100"
>
	<div class="font-medium" id="native-storage-type">Storage type</div>
	{#each [{ value: 'ssd', label: 'SSD' }, { value: 'hdd', label: 'HDD' }] as option (option.value)}
		<div class="flex items-center gap-2">
			<Radio.Root
				value={option.value}
				id="native-storage-{option.value}"
				nativeButton
				class="flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
			>
				{#snippet render(props, _state, children)}
					<button type="button" {...props}>{@render children?.()}</button>
				{/snippet}
				<Radio.Indicator
					class="flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900"
				/>
			</Radio.Root>
			<label for="native-storage-{option.value}">{option.label}</label>
		</div>
	{/each}
</RadioGroup>
```

To wrap a native button in a `<label>`, render the label from the `render` snippet. The hidden input then stays outside the label, so the markup is valid.

```svelte
<Radio.Root value="ssd" nativeButton>
	{#snippet render(props, _state, children)}
		<label>
			<button type="button" {...props}>{@render children?.()}</button>
			SSD
		</label>
	{/snippet}
</Radio.Root>
```

### Disabled and read-only

Set `disabled` on the group to disable every radio, or on a single `Radio.Root` to disable that radio. Set `readonly` on the group to keep the selection fixed while the radios stay focusable.

```svelte demo
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';

	const radioClass =
		'flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 data-[disabled]:opacity-50 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600';
	const indicatorClass =
		'flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900';
</script>

<div class="flex gap-8 text-sm text-gray-900 dark:text-gray-100">
	<RadioGroup readonly defaultValue="a" aria-label="Read-only" class="flex flex-col gap-1">
		<label class="flex items-center gap-2">
			<Radio.Root value="a" class={radioClass}
				><Radio.Indicator class={indicatorClass} /></Radio.Root
			>
			Read-only A
		</label>
		<label class="flex items-center gap-2">
			<Radio.Root value="b" class={radioClass}
				><Radio.Indicator class={indicatorClass} /></Radio.Root
			>
			Read-only B
		</label>
	</RadioGroup>
	<RadioGroup defaultValue="a" aria-label="One disabled radio" class="flex flex-col gap-1">
		<label class="flex items-center gap-2">
			<Radio.Root value="a" class={radioClass}
				><Radio.Indicator class={indicatorClass} /></Radio.Root
			>
			Enabled
		</label>
		<label class="flex items-center gap-2">
			<Radio.Root value="b" disabled class={radioClass}>
				<Radio.Indicator class={indicatorClass} />
			</Radio.Root>
			Disabled
		</label>
	</RadioGroup>
</div>
```

### Form submission

Set `name` on the group to submit the selected value with a form. Each radio's `value` is the submitted value. A value that is not a string is submitted as JSON. Set `required` to require a selection before the form submits.

```svelte demo
<script lang="ts">
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';

	let submitted = $state('');
</script>

<form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onsubmit={(event) => {
		event.preventDefault();
		submitted = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
	}}
>
	<RadioGroup name="storage" required aria-label="Storage" class="flex flex-col items-start gap-1">
		{#each ['ssd', 'hdd'] as type (type)}
			<label class="flex items-center gap-2 uppercase">
				<Radio.Root
					value={type}
					class="flex size-5 items-center justify-center rounded-full outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
				>
					<Radio.Indicator
						class="flex before:size-2 before:rounded-full before:bg-gray-50 dark:before:bg-gray-900"
					/>
				</Radio.Root>
				{type}
			</label>
		{/each}
	</RadioGroup>
	<button
		type="submit"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		Submit
	</button>
	<output class="font-mono text-xs">{submitted || 'Nothing submitted yet'}</output>
</form>
```

### Field and Fieldset

Use `Field` and `Fieldset` to label the group and to join it to a `Form`. Render the `RadioGroup` from `Fieldset.Root`, so `Fieldset.Legend` names the group. Wrap each radio in a `Field.Item` with a `Field.Label`, and set `name` on the `Field.Root`.

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
	import { Form } from '@sveltery/base/form';
	import { Radio } from '@sveltery/base/radio';
	import { RadioGroup } from '@sveltery/base/radio-group';
</script>

<Form>
	<Field.Root name="storageType">
		<Fieldset.Root>
			{#snippet render(props, _state, children)}
				<RadioGroup {...props}>{@render children?.()}</RadioGroup>
			{/snippet}
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<Field.Item>
				<Field.Label>
					<Radio.Root value="ssd" />
					SSD
				</Field.Label>
			</Field.Item>
			<Field.Item>
				<Field.Label>
					<Radio.Root value="hdd" />
					HDD
				</Field.Label>
			</Field.Item>
		</Fieldset.Root>
	</Field.Root>
</Form>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. Radio Group keeps `defaultValue`, because it is a form control. It is the value an empty binding starts from and the value a form reset restores. The other form controls that keep `defaultValue` or `defaultChecked` are Checkbox, Checkbox Group, Switch, Slider, Number Field, OTP Field, and `Field.Control`.
- `onValueChange` runs before the value changes. Call `eventDetails.cancel()` to keep the group as it is.
- Use `readonly` in lowercase, as on an HTML input. The state key is still `readOnly`.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in a radio's `onclick` to skip its own click handler.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- The group and the radios come from two imports. `RadioGroup` is in `@sveltery/base/radio-group`, and `Radio` is in `@sveltery/base/radio`.
- The group claims the field's label and names itself with `aria-labelledby`. Radios keep distinct ids, and a `Field.Item` label points `for` at its own radio.
- A native form reset restores `defaultValue`. The visible state of each radio catches up one task after the reset.
- `inputRef`, scroll-into-view, and the text-field arrow key exceptions are not available.

## API reference

### RadioGroup

<ApiPart name="radio-group" part="RadioGroup" />

| Attribute       | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `data-disabled` | Present when the group is disabled.                                    |
| `data-readonly` | Present when the group is read-only.                                   |
| `data-required` | Present when the group is required.                                    |
| `data-valid`    | Present when the group is valid. Set only inside `Field.Root`.         |
| `data-invalid`  | Present when the group is invalid. Set only inside `Field.Root`.       |
| `data-dirty`    | Present when the value has changed. Set only inside `Field.Root`.      |
| `data-touched`  | Present when the group has been touched. Set only inside `Field.Root`. |
| `data-filled`   | Present when a radio is selected. Set only inside `Field.Root`.        |
| `data-focused`  | Present when the group has focus. Set only inside `Field.Root`.        |

### Radio.Root

<ApiPart name="radio" part="Root" />

| Attribute        | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `data-checked`   | Present when the radio is selected.                                    |
| `data-unchecked` | Present when the radio is not selected.                                |
| `data-disabled`  | Present when the radio is disabled, or its group is.                   |
| `data-readonly`  | Present when the radio is read-only, or its group is.                  |
| `data-required`  | Present when the radio is required, or its group is.                   |
| `data-valid`     | Present when the radio is valid. Set only inside `Field.Root`.         |
| `data-invalid`   | Present when the radio is invalid. Set only inside `Field.Root`.       |
| `data-dirty`     | Present when the value has changed. Set only inside `Field.Root`.      |
| `data-touched`   | Present when the radio has been touched. Set only inside `Field.Root`. |
| `data-filled`    | Present when a radio is selected. Set only inside `Field.Root`.        |
| `data-focused`   | Present when the radio has focus. Set only inside `Field.Root`.        |

### Radio.Indicator

<ApiPart name="radio" part="Indicator" />

| Attribute             | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| `data-checked`        | Present when the radio is selected.                                    |
| `data-unchecked`      | Present when the radio is not selected. Needs `keepMounted`.           |
| `data-disabled`       | Present when the radio is disabled, or its group is.                   |
| `data-readonly`       | Present when the radio is read-only, or its group is.                  |
| `data-required`       | Present when the radio is required, or its group is.                   |
| `data-valid`          | Present when the radio is valid. Set only inside `Field.Root`.         |
| `data-invalid`        | Present when the radio is invalid. Set only inside `Field.Root`.       |
| `data-dirty`          | Present when the value has changed. Set only inside `Field.Root`.      |
| `data-touched`        | Present when the radio has been touched. Set only inside `Field.Root`. |
| `data-filled`         | Present when a radio is selected. Set only inside `Field.Root`.        |
| `data-focused`        | Present when the radio has focus. Set only inside `Field.Root`.        |
| `data-starting-style` | Present when the indicator is animating in.                            |
| `data-ending-style`   | Present when the indicator is animating out.                           |
