---
title: Toggle
description: A two-state button that can be on or off.
---

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
</script>

<Toggle
	aria-label="Favorite"
	class="flex size-8 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:data-[pressed]:text-gray-100"
>
	{#snippet render(props, state)}
		<button {...props}>
			<svg
				viewBox="0 0 24 24"
				class="size-5"
				fill={state.pressed ? 'currentColor' : 'none'}
				stroke="currentColor"
				stroke-width="2"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path
					d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
				/>
			</svg>
		</button>
	{/snippet}
</Toggle>
```

## Anatomy

Toggle is a single part. Import it and use it as a component:

```svelte
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
</script>

<Toggle />
```

## Examples

### Pressed state

Bind `pressed` to read and change whether the toggle is pressed. Without `bind:`, the toggle manages its own state, and a value you pass sets the initial state.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';

	let pressed = $state(false);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Toggle
		bind:pressed
		class="rounded-sm border border-gray-200 px-3 py-1 font-medium select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[pressed]:bg-gray-900 data-[pressed]:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-100 dark:data-[pressed]:text-gray-900"
	>
		Bold
	</Toggle>
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={pressed} />
		Pressed from outside
	</label>
</div>
```

### Disabled

Set `disabled` to ignore user interaction. The toggle renders a disabled `<button>` and sets `data-disabled`.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
</script>

<Toggle
	disabled
	pressed
	class="rounded-sm border border-gray-200 px-3 py-1 text-sm font-medium text-gray-900 select-none data-[disabled]:opacity-50 data-[pressed]:bg-gray-200 dark:border-gray-700 dark:text-gray-100 dark:data-[pressed]:bg-gray-700"
>
	Italic
</Toggle>
```

### Cancel a change

`onPressedChange` runs before the state changes. Call `eventDetails.cancel()` to keep the toggle as it is. This toggle accepts a press but refuses to be released.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';

	let pressed = $state(false);
</script>

<div class="flex flex-col items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
	<Toggle
		bind:pressed
		onPressedChange={(next, eventDetails) => {
			if (!next) eventDetails.cancel();
		}}
		class="rounded-sm border border-gray-200 px-3 py-1 font-medium select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[pressed]:bg-gray-900 data-[pressed]:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-100 dark:data-[pressed]:text-gray-900"
	>
		Pin
	</Toggle>
	<p>The toggle is {pressed ? 'pressed' : 'not pressed'}.</p>
</div>
```

### Inside a toggle group

A toggle with a `value` can sit inside a [Toggle Group](/components/toggle-group). The group then decides whether the toggle is pressed.

## Differences from Base UI

- `pressed` is one bindable prop. Use `bind:pressed` instead of `pressed` and `onPressedChange` together. There is no `defaultPressed` prop: pass `pressed` without `bind:` to set the initial state.
- `onPressedChange` runs before the state changes. Call `eventDetails.cancel()` to keep the toggle as it is.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in `onclick` to skip the toggle's own click handler.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below, or read the state that a `render` snippet receives as its second argument.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Toggle never takes part in a form. It ignores the `type` and `form` props. A native toggle renders `<button type="button">`.

## API reference

### Toggle

<ApiPart name="toggle" part="Toggle" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-pressed`  | Present when the toggle is pressed.  |
| `data-disabled` | Present when the toggle is disabled. |
