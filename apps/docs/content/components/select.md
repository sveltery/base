---
title: Select
description: A common form component for choosing a predefined value in a dropdown menu.
---

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';

	const fonts = { sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace', cursive: 'Cursive' };
</script>

<Select.Root items={fonts} defaultValue="sans">
	<Select.Trigger
		class="flex h-10 min-w-40 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 pr-3 pl-3.5 text-base text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		<Select.Value />
		<Select.Icon class="flex text-gray-600 dark:text-gray-400">▾</Select.Icon>
	</Select.Trigger>
	<Select.Portal>
		<Select.Positioner class="z-10 outline-none select-none" sideOffset={8}>
			<Select.Popup
				class="max-h-[var(--available-height)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:scale-100 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				{#each Object.entries(fonts) as [value, label] (value)}
					<Select.Item
						{value}
						class="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
					>
						<Select.ItemIndicator class="col-start-1">✓</Select.ItemIndicator>
						<Select.ItemText class="col-start-2">{label}</Select.ItemText>
					</Select.Item>
				{/each}
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Select } from '@sveltery/base/select';
</script>

<Select.Root>
	<Select.Label />
	<Select.Trigger>
		<Select.Value />
		<Select.Icon />
	</Select.Trigger>
	<Select.Portal>
		<Select.Backdrop />
		<Select.Positioner>
			<Select.ScrollUpArrow />
			<Select.Popup>
				<Select.Arrow />
				<Select.List>
					<Select.Item>
						<Select.ItemText />
						<Select.ItemIndicator />
					</Select.Item>
					<Select.Separator />
					<Select.Group>
						<Select.GroupLabel />
					</Select.Group>
				</Select.List>
			</Select.Popup>
			<Select.ScrollDownArrow />
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
```

`Select.Positioner` and `Select.Popup` are required. `Select.List` is optional: without it the popup is the listbox and scrolls itself.

## Examples

### Bind the value

Bind `value` to read and change the selection. Without `bind:`, the select manages its own value, and `defaultValue` sets the value it starts from and the value a form reset restores. `onValueChange` runs before every change, and `eventDetails.cancel()` keeps the current value.

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';

	const sizes = { s: 'Small', m: 'Medium', l: 'Large' };
	let size = $state<string | null>('m');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Select.Root items={sizes} bind:value={size}>
		<Select.Trigger
			class="flex h-10 min-w-36 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			<Select.Value />
			<Select.Icon>▾</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class="z-10" sideOffset={8}>
				<Select.Popup
					class="rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
				>
					{#each Object.entries(sizes) as [value, label] (value)}
						<Select.Item
							{value}
							class="min-w-[var(--anchor-width)] cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 data-[selected]:font-medium dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
						>
							<Select.ItemText>{label}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
	<button
		type="button"
		class="rounded-md border border-gray-200 px-3 py-1.5 dark:border-gray-700"
		onclick={() => (size = null)}
	>
		Clear
	</button>
	<p>Value: {size ?? 'none'}</p>
</div>
```

### Labels and placeholder

`Select.Value` shows the label of the selected value when the root has `items`: a record of labels by value, an array of `{ value, label }` objects, or groups of them. Without `items`, it shows the value itself. `placeholder` shows while nothing is selected. Pass a `children` snippet to format the value yourself.

```svelte
<Select.Root items={{ sans: 'Sans-serif', serif: 'Serif' }}>
	<Select.Trigger>
		<Select.Value placeholder="Choose a font" />
	</Select.Trigger>
	…
</Select.Root>

<Select.Value>
	{#snippet children(value)}{value ? `Font: ${value}` : 'No font'}{/snippet}
</Select.Value>
```

For object values, `itemToStringLabel` gives the label and `itemToStringValue` the string a form submits. A `{ value, label }` object uses its own fields. `isItemEqualToValue` matches values that are not the same reference.

### Multiple selection

Set `multiple` to let the user pick several items. The value is an array, the popup stays open after each pick, and `Select.Value` lists the labels separated by commas.

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';

	const toppings = { cheese: 'Cheese', olives: 'Olives', peppers: 'Peppers', onions: 'Onions' };
	let picked = $state<string[]>(['cheese']);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Select.Root items={toppings} multiple bind:value={picked}>
		<Select.Trigger
			class="flex h-10 min-w-48 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			<Select.Value placeholder="No toppings" />
			<Select.Icon>▾</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class="z-10" sideOffset={8} alignItemWithTrigger={false}>
				<Select.Popup
					class="rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
				>
					{#each Object.entries(toppings) as [value, label] (value)}
						<Select.Item
							{value}
							class="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
						>
							<Select.ItemIndicator class="col-start-1">✓</Select.ItemIndicator>
							<Select.ItemText class="col-start-2">{label}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
	<p>Picked: {picked.join(', ') || 'nothing'}</p>
</div>
```

### Align the item with the trigger

By default, a select opened with a mouse or the keyboard lays the popup over the trigger so the selected item sits where the trigger's text is, as a native select does. The positioner then reports `data-side="none"`. Touch input, or `alignItemWithTrigger={false}` on `Select.Positioner`, places the popup next to the trigger like any other popup, using `side`, `align` and the offsets.

```svelte
<Select.Positioner alignItemWithTrigger={false} side="bottom" sideOffset={8}>…</Select.Positioner>
```

When the aligned popup is taller than the space around the trigger, it grows as the user scrolls. Add `Select.ScrollUpArrow` and `Select.ScrollDownArrow` inside the positioner to scroll by hovering.

### Use with a field and form

Wrap the select in `Field.Root` to label it, describe it and validate it. `Field.Label` names the trigger, `name` on the field or the root sets the submitted name, and `required` blocks an empty submit with a `valueMissing` error. The root renders a hidden input that carries the serialized value, so a plain `<form>` submits it too. A `multiple` select submits each value under the same name.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { Select } from '@sveltery/base/select';

	const regions = { eu: 'Europe', us: 'United States', apac: 'Asia Pacific' };
	let submitted = $state('');
</script>

<Form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onFormSubmit={(values) => (submitted = JSON.stringify(values))}
>
	<Field.Root name="region" class="flex flex-col items-start gap-1">
		<Field.Label class="font-medium">Region</Field.Label>
		<Select.Root items={regions} required>
			<Select.Trigger
				class="flex h-10 min-w-48 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
			>
				<Select.Value placeholder="Choose a region" />
				<Select.Icon>▾</Select.Icon>
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner class="z-10" sideOffset={8}>
					<Select.Popup
						class="rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
					>
						{#each Object.entries(regions) as [value, label] (value)}
							<Select.Item
								{value}
								class="min-w-[var(--anchor-width)] cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
							>
								<Select.ItemText>{label}</Select.ItemText>
							</Select.Item>
						{/each}
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
		<Field.Error class="text-red-700 dark:text-red-400" />
	</Field.Root>
	<button type="submit" class="rounded-md border border-gray-200 px-3 py-1.5 dark:border-gray-700">
		Submit
	</button>
	<p>Submitted: {submitted || 'nothing yet'}</p>
</Form>
```

### Groups

Wrap items in `Select.Group` with a `Select.GroupLabel` to label a set of options. `Select.Separator` draws a line between groups.

```svelte
<Select.Popup>
	<Select.Group>
		<Select.GroupLabel>Fruits</Select.GroupLabel>
		<Select.Item value="apple"><Select.ItemText>Apple</Select.ItemText></Select.Item>
	</Select.Group>
	<Select.Separator />
	<Select.Group>
		<Select.GroupLabel>Vegetables</Select.GroupLabel>
		<Select.Item value="carrot"><Select.ItemText>Carrot</Select.ItemText></Select.Item>
	</Select.Group>
</Select.Popup>
```

## Differences from Base UI

- `value` and `open` are bindable props. Use `bind:value` and `bind:open` instead of a value and its change callback together. `defaultValue` stays, because Select is a form control: it is the value an empty binding starts from and the value a form reset restores. There is no `defaultOpen`: pass `open` without `bind:` to set the initial state.
- `onValueChange` and `onOpenChange` run before the state changes. Call `eventDetails.cancel()` to keep the current state. Setting `value` or `open` yourself calls neither.
- Labels in `items`, the `placeholder`, and the text `itemToStringLabel` returns are strings. Format richer content with the `Select.Value` `children` snippet.
- `actionsRef` is not available. Use `bind:this` on `Select.Root`, which exposes `close()` and `unmount()`. `unmount()` does nothing while the popup is open.
- `inputRef` is not available. A `multiple` select submits through one hidden `<select multiple>` instead of one hidden input per value. `FormData` holds the same entries.
- A native form reset restores `defaultValue`, as the other form controls do. React Base UI keeps its state.
- `readonly` and `autocomplete` use the HTML spelling, so the root takes `readonly`, not `readOnly`. Handlers use lowercase names such as `onclick`. Call `event.preventDefault()` in a part's handler to skip the part's own handling.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Select.Root` renders no element, so it has no `render`.

## API reference

### Root

<ApiPart name="select" part="Root" />

`Select.Root` renders no element of its own, only the hidden inputs a form submits, so it has no data attributes.

### Label

<ApiPart name="select" part="Label" />

### Trigger

<ApiPart name="select" part="Trigger" />

| Attribute          | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `data-popup-open`  | Present when the popup is open.                                          |
| `data-pressed`     | Present while the trigger is pressed.                                    |
| `data-disabled`    | Present when the select is disabled.                                     |
| `data-readonly`    | Present when the select is read-only.                                    |
| `data-required`    | Present when the select is required.                                     |
| `data-popup-side`  | The side of the trigger the popup is on, while the popup is mounted.     |
| `data-placeholder` | Present when the select has no value.                                    |
| `data-valid`       | Present when the select is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`     | Present when the select is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`       | Present when the value has changed. Needs a `Field.Root` ancestor.       |
| `data-touched`     | Present when the select has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`      | Present when the select has a value. Needs a `Field.Root` ancestor.      |
| `data-focused`     | Present when the trigger is focused. Needs a `Field.Root` ancestor.      |

### Value

<ApiPart name="select" part="Value" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-placeholder` | Present when the select has no value. |

### Icon

<ApiPart name="select" part="Icon" />

| Attribute         | Description                     |
| ----------------- | ------------------------------- |
| `data-popup-open` | Present when the popup is open. |

### Portal

<ApiPart name="select" part="Portal" />

### Backdrop

<ApiPart name="select" part="Backdrop" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-open`           | Present when the select is open.         |
| `data-closed`         | Present when the select is closed.       |
| `data-starting-style` | Present when the popup is animating in.  |
| `data-ending-style`   | Present when the popup is animating out. |

### Positioner

<ApiPart name="select" part="Positioner" />

| Attribute            | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| `data-open`          | Present when the popup is open.                                                  |
| `data-closed`        | Present when the popup is closed.                                                |
| `data-anchor-hidden` | Present when the trigger is hidden or clipped.                                   |
| `data-side`          | The side of the trigger the popup is on, or `none` when it overlaps the trigger. |
| `data-align`         | How the popup lines up with the trigger.                                         |

| CSS variable         | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `--anchor-width`     | The width of the trigger.                                    |
| `--anchor-height`    | The height of the trigger.                                   |
| `--available-width`  | The width between the trigger and the edge of the viewport.  |
| `--available-height` | The height between the trigger and the edge of the viewport. |
| `--transform-origin` | The point the popup grows from, for scale animations.        |

### Popup

<ApiPart name="select" part="Popup" />

| Attribute             | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `data-open`           | Present when the popup is open.                                                  |
| `data-closed`         | Present when the popup is closed.                                                |
| `data-side`           | The side of the trigger the popup is on, or `none` when it overlaps the trigger. |
| `data-align`          | How the popup lines up with the trigger.                                         |
| `data-starting-style` | Present when the popup is animating in.                                          |
| `data-ending-style`   | Present when the popup is animating out.                                         |

### List

<ApiPart name="select" part="List" />

### Item

<ApiPart name="select" part="Item" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-selected`    | Present when the item is selected.    |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### ItemText

<ApiPart name="select" part="ItemText" />

### ItemIndicator

<ApiPart name="select" part="ItemIndicator" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |

### Arrow

<ApiPart name="select" part="Arrow" />

The arrow renders nothing while the popup overlaps the trigger.

| Attribute         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `data-open`       | Present when the popup is open.                                   |
| `data-closed`     | Present when the popup is closed.                                 |
| `data-side`       | The side of the trigger the popup is on.                          |
| `data-align`      | How the popup lines up with the trigger.                          |
| `data-uncentered` | Present when the arrow cannot point at the center of the trigger. |

### ScrollUpArrow

<ApiPart name="select" part="ScrollUpArrow" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-direction`      | `up`.                                    |
| `data-visible`        | Present when the list can scroll up.     |
| `data-side`           | The side of the trigger the popup is on. |
| `data-starting-style` | Present when the arrow is animating in.  |
| `data-ending-style`   | Present when the arrow is animating out. |

### ScrollDownArrow

<ApiPart name="select" part="ScrollDownArrow" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-direction`      | `down`.                                  |
| `data-visible`        | Present when the list can scroll down.   |
| `data-side`           | The side of the trigger the popup is on. |
| `data-starting-style` | Present when the arrow is animating in.  |
| `data-ending-style`   | Present when the arrow is animating out. |

### Group

<ApiPart name="select" part="Group" />

### GroupLabel

<ApiPart name="select" part="GroupLabel" />

### Separator

<ApiPart name="select" part="Separator" />
