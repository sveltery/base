---
title: Toggle Group
description: Provides a shared state to a series of toggle buttons.
---

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';

	const alignments = [
		{ value: 'left', label: 'Align left', path: 'M3 6h18M3 12h12M3 18h16' },
		{ value: 'center', label: 'Align center', path: 'M3 6h18M6 12h12M4 18h16' },
		{ value: 'right', label: 'Align right', path: 'M3 6h18M9 12h12M5 18h16' }
	];
</script>

<ToggleGroup
	aria-label="Text alignment"
	value={['left']}
	class="flex gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
>
	{#each alignments as alignment (alignment.value)}
		<Toggle
			value={alignment.value}
			aria-label={alignment.label}
			class="flex size-8 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100"
		>
			<svg
				viewBox="0 0 24 24"
				class="size-4"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<path d={alignment.path} />
			</svg>
		</Toggle>
	{/each}
</ToggleGroup>
```

## Anatomy

Import the group and `Toggle`, then place toggles inside the group:

```svelte
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';
</script>

<ToggleGroup>
	<Toggle value="left" />
</ToggleGroup>
```

## Examples

### Value

Each toggle takes a `value`. The group's `value` is the array of values that are pressed. Bind `value` to read and change the array. Without `bind:`, the group manages its own state, and an array you pass sets the initial state.

By default, one toggle can be pressed at a time. Pressing another toggle releases the first, and pressing the pressed toggle releases it.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';

	const views = ['day', 'week', 'month'];
	let value = $state<string[]>(['week']);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<ToggleGroup
		bind:value
		aria-label="Calendar view"
		class="flex gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
	>
		{#each views as view (view)}
			<Toggle
				value={view}
				class="rounded-sm px-3 py-1 font-medium text-gray-600 capitalize select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100"
			>
				{view}
			</Toggle>
		{/each}
	</ToggleGroup>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (value = ['month'])}
	>
		Show month
	</button>
	<p>Pressed: {value.length ? value.join(', ') : 'none'}</p>
</div>
```

To veto a change, call `eventDetails.cancel()` in `onValueChange` or in a toggle's `onPressedChange`. Neither the toggle nor the group then changes.

### Multiple

Set `multiple` to let users press more than one toggle at once.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';
</script>

<ToggleGroup
	multiple
	value={['bold', 'italic']}
	aria-label="Text formatting"
	class="flex gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
>
	<Toggle
		value="bold"
		aria-label="Bold"
		class="flex size-8 items-center justify-center rounded-sm font-bold text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100"
	>
		B
	</Toggle>
	<Toggle
		value="italic"
		aria-label="Italic"
		class="flex size-8 items-center justify-center rounded-sm text-gray-600 italic select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100"
	>
		I
	</Toggle>
	<Toggle
		value="underline"
		aria-label="Underline"
		class="flex size-8 items-center justify-center rounded-sm text-gray-600 underline select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100"
	>
		U
	</Toggle>
</ToggleGroup>
```

### Orientation

Set `orientation` to `vertical` so the Up and Down arrow keys move focus between toggles. The default is `horizontal`, where the Left and Right arrow keys move focus. The group sets `data-orientation`, so you can lay it out to match.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';
</script>

<ToggleGroup
	orientation="vertical"
	aria-label="Sort order"
	value={['name']}
	class="flex w-32 flex-col gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 text-sm dark:border-gray-700 dark:bg-gray-900"
>
	{#each ['name', 'date', 'size'] as key (key)}
		<Toggle
			value={key}
			class="rounded-sm px-3 py-1 text-left font-medium text-gray-600 capitalize select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100"
		>
			{key}
		</Toggle>
	{/each}
</ToggleGroup>
```

### Keyboard

The group is one tab stop. Tab moves focus to the first toggle, or to the toggle that last had focus. The arrow keys move focus between toggles. Home and End move focus to the first and last toggle. By default, focus wraps from the last toggle to the first. Set `loopFocus={false}` to stop at the ends. Moving focus does not press a toggle. Press Space or Enter to press the focused toggle.

### Disabled

Set `disabled` on the group to disable every toggle, or on a single `Toggle` to disable that toggle. The arrow keys skip a disabled toggle.

```svelte demo
<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';

	const toggleClass =
		'rounded-sm px-3 py-1 text-sm font-medium text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[disabled]:opacity-50 data-[pressed]:bg-gray-200 data-[pressed]:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:data-[pressed]:bg-gray-700 dark:data-[pressed]:text-gray-100';
</script>

<ToggleGroup
	aria-label="Plan"
	value={['pro']}
	class="flex gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
>
	<Toggle value="free" class={toggleClass}>Free</Toggle>
	<Toggle value="pro" class={toggleClass}>Pro</Toggle>
	<Toggle value="team" disabled class={toggleClass}>Team</Toggle>
</ToggleGroup>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. There is no `defaultValue` prop: pass `value` without `bind:` to set the initial state. A value you pass holds until the parent changes it, and a press updates the group's own state.
- `onValueChange` runs before the value changes. Call `eventDetails.cancel()` to keep the group as it is. A toggle's `onPressedChange` runs first, and canceling there stops the group change too.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Every `Toggle` in the group needs its own `value`. A toggle without one gets a generated id, and the toggle logs an error when the group has a `value`.
- The group always owns roving focus. Toolbar integration, grid composite keyboard navigation, and scroll-into-view are not available.

## API reference

### ToggleGroup

<ApiPart name="toggle-group" part="ToggleGroup" />

| Attribute          | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `data-orientation` | The group's orientation, `horizontal` or `vertical`.               |
| `data-disabled`    | Present when the group is disabled.                                |
| `data-multiple`    | Present when more than one toggle can be pressed at the same time. |
