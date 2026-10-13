---
title: Switch
description: A control that indicates whether a setting is on or off.
---

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<label class="flex items-center gap-3 text-base text-gray-900 dark:text-gray-100">
	<Switch.Root
		defaultChecked
		class="relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 outline-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-600 dark:data-[checked]:bg-gray-100"
	>
		<Switch.Thumb
			class="aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900"
		/>
	</Switch.Root>
	Notifications
</label>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<Switch.Root>
	<Switch.Thumb />
</Switch.Root>
```

## Examples

### Labeling

A switch needs an accessible name. Wrap the switch and its text in a `<label>`, as the demo above does. You can also name a switch with `Field.Label` inside a `Field.Root`.

### Checked state

Bind `checked` to read and change whether the switch is on. Without `bind:`, the switch manages its own state. Use `defaultChecked` to set the initial state of an unbound switch.

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';

	let checked = $state(false);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-3">
		<Switch.Root
			bind:checked
			class="relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 outline-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-600 dark:data-[checked]:bg-gray-100"
		>
			<Switch.Thumb
				class="aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900"
			/>
		</Switch.Root>
		Airplane mode
	</label>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (checked = !checked)}
	>
		Airplane mode is {checked ? 'on' : 'off'}
	</button>
</div>
```

To veto a change, call `eventDetails.cancel()` in `onCheckedChange`. The switch then keeps its current state.

### Native button

`Switch.Root` renders a `<span>` and a hidden `<input>` by default. To use a sibling `<label for>`, set `nativeButton` and render a `<button>` with the `render` snippet. The `id` then goes on the button, so the label points at it.

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<div class="flex items-center gap-3 text-base text-gray-900 dark:text-gray-100">
	<label for="notifications-switch">Notifications</label>
	<Switch.Root
		id="notifications-switch"
		nativeButton
		class="relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 outline-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-600 dark:data-[checked]:bg-gray-100"
	>
		{#snippet render(props, _state, children)}
			<button type="button" {...props}>{@render children?.()}</button>
		{/snippet}
		<Switch.Thumb
			class="aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900"
		/>
	</Switch.Root>
</div>
```

To wrap a native button in a `<label>`, render the label from the `render` snippet. The hidden input then stays outside the label, so the markup is valid.

```svelte
<Switch.Root nativeButton>
	{#snippet render(props, _state, children)}
		<label>
			<button type="button" {...props}>{@render children?.()}</button>
			Notifications
		</label>
	{/snippet}
</Switch.Root>
```

### Disabled and read-only

Set `disabled` to ignore user interaction. Set `readonly` to keep the state fixed while the switch stays focusable. Style both with `data-[disabled]` and `data-[readonly]`.

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';

	const rootClass =
		'relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 outline-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[disabled]:opacity-50 dark:bg-gray-600 dark:data-[checked]:bg-gray-100';
	const thumbClass =
		'aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900';
</script>

<div class="flex flex-col gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-3">
		<Switch.Root disabled defaultChecked class={rootClass}
			><Switch.Thumb class={thumbClass} /></Switch.Root
		>
		Disabled
	</label>
	<label class="flex items-center gap-3">
		<Switch.Root readonly defaultChecked class={rootClass}>
			<Switch.Thumb class={thumbClass} />
		</Switch.Root>
		Read-only
	</label>
</div>
```

### Form submission

Set `name` to submit the switch with a form. An on switch submits its `value`, or `on` when you set no `value`. An off switch submits nothing, unless you set `uncheckedValue`. Set `required` to require the switch to be on before the form submits.

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';

	let submitted = $state('');
</script>

<form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onsubmit={(event) => {
		event.preventDefault();
		submitted = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
	}}
>
	<label class="flex items-center gap-3">
		<Switch.Root
			name="notifications"
			value="enabled"
			uncheckedValue="disabled"
			class="relative flex h-6 w-10 shrink-0 rounded-full bg-gray-300 p-0.5 outline-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-600 dark:data-[checked]:bg-gray-100"
		>
			<Switch.Thumb
				class="aspect-square h-full rounded-full bg-white shadow-sm transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-100 dark:data-[checked]:bg-gray-900"
			/>
		</Switch.Root>
		Notifications
	</label>
	<button
		type="submit"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		Submit
	</button>
	<output class="font-mono text-xs">{submitted || 'Nothing submitted yet'}</output>
</form>
```

### Field integration

Inside a `Field.Root`, the switch takes the field's `name` and `disabled` state and joins its validation. Put the switch inside a `Field.Label` to name it.

```svelte
<Form>
	<Field.Root name="notifications">
		<Field.Label>
			<Switch.Root>
				<Switch.Thumb />
			</Switch.Root>
			Notifications
		</Field.Label>
	</Field.Root>
</Form>
```

## Differences from Base UI

- `checked` is one bindable prop. Use `bind:checked` instead of `checked` and `onCheckedChange` together. A switch with no binding manages its own state. Switch keeps `defaultChecked`, because it is a form control. It is the state an empty binding starts from and the state a form reset restores. The other form controls that keep `defaultValue` or `defaultChecked` are Checkbox, Checkbox Group, Radio Group, Slider, Number Field, OTP Field, and `Field.Control`.
- `onCheckedChange` runs before the state changes. Call `eventDetails.cancel()` to keep the switch as it is.
- Use `readonly` in lowercase, as on an HTML input. The state key is still `readOnly`.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in `onclick` to skip the switch's own click handler.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- A native form reset restores `defaultChecked`. The visible state of the switch catches up one task after the reset.
- `inputRef` is not available.

## API reference

### Root

<ApiPart name="switch" part="Root" />

| Attribute        | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `data-checked`   | Present when the switch is on.                                          |
| `data-unchecked` | Present when the switch is off.                                         |
| `data-disabled`  | Present when the switch is disabled.                                    |
| `data-readonly`  | Present when the switch is read-only.                                   |
| `data-required`  | Present when the switch is required.                                    |
| `data-valid`     | Present when the switch is valid. Set only inside `Field.Root`.         |
| `data-invalid`   | Present when the switch is invalid. Set only inside `Field.Root`.       |
| `data-dirty`     | Present when the value has changed. Set only inside `Field.Root`.       |
| `data-touched`   | Present when the switch has been touched. Set only inside `Field.Root`. |
| `data-filled`    | Present when the switch is on. Set only inside `Field.Root`.            |
| `data-focused`   | Present when the switch has focus. Set only inside `Field.Root`.        |

### Thumb

<ApiPart name="switch" part="Thumb" />

| Attribute        | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `data-checked`   | Present when the switch is on.                                          |
| `data-unchecked` | Present when the switch is off.                                         |
| `data-disabled`  | Present when the switch is disabled.                                    |
| `data-readonly`  | Present when the switch is read-only.                                   |
| `data-required`  | Present when the switch is required.                                    |
| `data-valid`     | Present when the switch is valid. Set only inside `Field.Root`.         |
| `data-invalid`   | Present when the switch is invalid. Set only inside `Field.Root`.       |
| `data-dirty`     | Present when the value has changed. Set only inside `Field.Root`.       |
| `data-touched`   | Present when the switch has been touched. Set only inside `Field.Root`. |
| `data-filled`    | Present when the switch is on. Set only inside `Field.Root`.            |
| `data-focused`   | Present when the switch has focus. Set only inside `Field.Root`.        |
