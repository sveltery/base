---
title: Combobox
description: An input combined with a list of predefined items to select.
---

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const fruits = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange'];
</script>

<Combobox.Root items={fruits}>
	<div class="flex flex-col gap-1 text-sm text-gray-900 dark:text-gray-100">
		<label for="fruit-input" class="font-medium">Choose a fruit</label>
		<Combobox.InputGroup
			class="flex h-10 w-64 items-center rounded-md border border-gray-200 bg-gray-50 pr-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
		>
			<Combobox.Input
				id="fruit-input"
				placeholder="e.g. Apple"
				class="h-full min-w-0 flex-1 bg-transparent pl-3.5 text-base outline-none"
			/>
			<Combobox.Clear
				aria-label="Clear selection"
				class="flex size-8 items-center justify-center rounded text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
			>
				×
			</Combobox.Clear>
			<Combobox.Trigger
				aria-label="Open popup"
				class="flex size-8 items-center justify-center rounded text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
			>
				▾
			</Combobox.Trigger>
		</Combobox.InputGroup>
	</div>
	<Combobox.Portal>
		<Combobox.Positioner class="z-10 outline-none" sideOffset={4}>
			<Combobox.Popup
				class="max-h-[min(var(--available-height),20rem)] w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Combobox.Empty class="px-4 py-2 text-sm text-gray-600 empty:hidden dark:text-gray-400">
					No fruits found.
				</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(fruit: string)}
							<Combobox.Item
								value={fruit}
								class="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
							>
								<Combobox.ItemIndicator class="col-start-1">✓</Combobox.ItemIndicator>
								<span class="col-start-2">{fruit}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
</script>

<Combobox.Root>
	<Combobox.Label />
	<Combobox.InputGroup>
		<Combobox.Chips>
			<Combobox.Chip>
				<Combobox.ChipRemove />
			</Combobox.Chip>
			<Combobox.Input />
		</Combobox.Chips>
		<Combobox.Clear />
		<Combobox.Trigger>
			<Combobox.Value />
			<Combobox.Icon />
		</Combobox.Trigger>
	</Combobox.InputGroup>
	<Combobox.Portal>
		<Combobox.Backdrop />
		<Combobox.Positioner>
			<Combobox.Popup>
				<Combobox.Arrow />
				<Combobox.Status />
				<Combobox.Empty />
				<Combobox.List>
					<Combobox.Row>
						<Combobox.Item>
							<Combobox.ItemIndicator />
						</Combobox.Item>
					</Combobox.Row>
					<Combobox.Separator />
					<Combobox.Group>
						<Combobox.GroupLabel />
						<Combobox.Collection />
					</Combobox.Group>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

`Combobox.Input`, `Combobox.Positioner` and `Combobox.Popup` are the usual minimum. The input can sit outside the popup, as above, or inside it with a `Combobox.Trigger` that shows the value, as in [Input inside the popup](#input-inside-the-popup).

## Examples

### Bind the value

Bind `value` to read and change the selection, and `inputValue` to read and change the text in the input. Without `bind:`, the combobox manages its own state, and `defaultValue` sets the value it starts from and the value a form reset restores. `onValueChange` and `onInputValueChange` run before every change, and `eventDetails.cancel()` keeps the current state.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const cities = ['Amsterdam', 'Berlin', 'Lisbon', 'Madrid', 'Paris', 'Rome', 'Vienna'];
	let city = $state<string | null>('Lisbon');
	let query = $state('');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Combobox.Root items={cities} bind:value={city} bind:inputValue={query}>
		<Combobox.Input
			aria-label="City"
			class="h-10 w-56 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
		/>
		<Combobox.Portal>
			<Combobox.Positioner class="z-10" sideOffset={4}>
				<Combobox.Popup
					class="w-[var(--anchor-width)] rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
				>
					<Combobox.List>
						<Combobox.Collection>
							{#snippet children(item: string)}
								<Combobox.Item
									value={item}
									class="cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 data-[selected]:font-medium dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
								>
									{item}
								</Combobox.Item>
							{/snippet}
						</Combobox.Collection>
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
	<button
		type="button"
		class="rounded-md border border-gray-200 px-3 py-1.5 dark:border-gray-700"
		onclick={() => (city = null)}
	>
		Clear
	</button>
	<p>Value: {city ?? 'none'}. Query: "{query}"</p>
</div>
```

### Items and filtering

Pass the items to the root's `items` and render them with `Combobox.Collection` inside `Combobox.List`. The root filters them by the input text and `Combobox.Collection` renders what matches. `Combobox.Empty` shows its children when nothing matches, and announces them to screen readers.

Items can be strings, `{ value, label }` objects, or groups of `{ value, items }`. For other objects, `itemToStringLabel` gives the label the input shows and the filter matches, `itemToStringValue` gives the string a form submits, and `isItemEqualToValue` matches values that are not the same reference. `createItems` builds a collection from your own data:

```ts
import { Combobox } from '@sveltery/base/combobox';

const countries = Combobox.createItems(data, {
	getValue: (country) => country.code,
	getLabel: (country) => country.name
});
```

`filter` replaces the matching function, and `filter={null}` turns filtering off. `Combobox.useFilter()` returns collator-based `contains`, `startsWith` and `endsWith` functions that honor the locale. To filter yourself, pass the result to `filteredItems`. `limit` caps how many matches render.

Inside the root, `Combobox.useFilteredItems()` returns the filtered items as `{ current }`, for a part that renders them itself.

### Multiple selection with chips

Set `multiple` to keep the popup open and let the user pick several items. Render each selected value as a `Combobox.Chip` inside `Combobox.Chips`. Arrow keys move between the chips and the input, Backspace or Delete on a chip removes it, and Backspace in an empty input removes the last chip.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const languages = ['Go', 'Python', 'Rust', 'Svelte', 'TypeScript', 'Zig'];
	let picked = $state<string[]>(['Svelte']);
</script>

<Combobox.Root items={languages} multiple bind:value={picked}>
	<Combobox.Chips
		class="flex w-80 flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-gray-50 p-1.5 text-sm text-gray-900 focus-within:outline-2 focus-within:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	>
		{#each picked as language (language)}
			<Combobox.Chip
				class="flex items-center gap-1 rounded bg-gray-200 py-0.5 pr-1 pl-2 outline-none focus:bg-gray-900 focus:text-gray-50 dark:bg-gray-700 dark:focus:bg-gray-100 dark:focus:text-gray-900"
			>
				{language}
				<Combobox.ChipRemove
					aria-label="Remove {language}"
					class="rounded px-1 hover:bg-gray-300 dark:hover:bg-gray-600"
				>
					×
				</Combobox.ChipRemove>
			</Combobox.Chip>
		{/each}
		<Combobox.Input
			aria-label="Languages"
			placeholder={picked.length ? '' : 'Add a language'}
			class="h-7 min-w-24 flex-1 bg-transparent px-1 text-base outline-none"
		/>
	</Combobox.Chips>
	<Combobox.Portal>
		<Combobox.Positioner class="z-10" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] rounded-md bg-gray-50 py-1 text-sm shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Combobox.Empty class="px-4 py-2 empty:hidden">No languages found.</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(item: string)}
							<Combobox.Item
								value={item}
								class="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
							>
								<Combobox.ItemIndicator class="col-start-1">✓</Combobox.ItemIndicator>
								<span class="col-start-2">{item}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

### Input inside the popup

Put `Combobox.Input` inside `Combobox.Popup` to make a select-like control with a search box. `Combobox.Trigger` opens the popup and shows the selection through `Combobox.Value`, the popup becomes a dialog, and focus moves to the input. `Combobox.Label` names the trigger in this layout.

```svelte
<Combobox.Root items={countries}>
	<Combobox.Label>Country</Combobox.Label>
	<Combobox.Trigger>
		<Combobox.Value placeholder="Select a country" />
		<Combobox.Icon />
	</Combobox.Trigger>
	<Combobox.Portal>
		<Combobox.Positioner>
			<Combobox.Popup>
				<Combobox.Input placeholder="Search" />
				<Combobox.List>…</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

### Use with a field and form

Wrap the combobox in `Field.Root` to label, describe and validate it. `Field.Label` names the input, `name` on the field or the root sets the submitted name, and `required` blocks an empty submit with a `valueMissing` error. The root renders a hidden input that carries the serialized value, so a plain `<form>` submits it too. A `multiple` combobox submits each value under the same name.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	const teams = ['Design', 'Engineering', 'Marketing', 'Sales', 'Support'];
	let submitted = $state('');
</script>

<Form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onFormSubmit={(values) => (submitted = JSON.stringify(values))}
>
	<Field.Root name="team" class="flex flex-col items-start gap-1">
		<Field.Label class="font-medium">Team</Field.Label>
		<Combobox.Root items={teams} required>
			<Combobox.Input
				placeholder="Choose a team"
				class="h-10 w-56 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base outline-none focus-visible:outline-2 focus-visible:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900"
			/>
			<Combobox.Portal>
				<Combobox.Positioner class="z-10" sideOffset={4}>
					<Combobox.Popup
						class="w-[var(--anchor-width)] rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
					>
						<Combobox.List>
							<Combobox.Collection>
								{#snippet children(item: string)}
									<Combobox.Item
										value={item}
										class="cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
									>
										{item}
									</Combobox.Item>
								{/snippet}
							</Combobox.Collection>
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
		<Field.Error class="text-red-700 dark:text-red-400" />
	</Field.Root>
	<button type="submit" class="rounded-md border border-gray-200 px-3 py-1.5 dark:border-gray-700">
		Submit
	</button>
	<p>Submitted: {submitted || 'nothing yet'}</p>
</Form>
```

### Groups and grids

Group items as `{ value, items }` entries and render each group with `Combobox.Group`, its own `Combobox.GroupLabel` and a nested `Combobox.Collection`, which renders that group's filtered items. Set `grid` on the root and wrap items in `Combobox.Row` to move through a grid with all four arrow keys.

```svelte
<Combobox.List>
	<Combobox.Collection>
		{#snippet children(group: { value: string; items: string[] })}
			<Combobox.Group items={group.items}>
				<Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
				<Combobox.Collection>
					{#snippet children(item: string)}
						<Combobox.Item value={item}>{item}</Combobox.Item>
					{/snippet}
				</Combobox.Collection>
			</Combobox.Group>
		{/snippet}
	</Combobox.Collection>
</Combobox.List>
```

## Differences from Base UI

- `value`, `inputValue` and `open` are bindable props. Use `bind:value`, `bind:inputValue` and `bind:open` instead of a value and its change callback together. `defaultValue` and `defaultInputValue` stay, because the combobox is a form control. There is no `defaultOpen`: pass `open` without `bind:` to set the initial state.
- `onValueChange`, `onInputValueChange` and `onOpenChange` run before the state changes. Call `eventDetails.cancel()` to keep the current state. Setting a bound prop yourself calls none of them.
- `Combobox.List` takes static children. Render the filtered items with `Combobox.Collection` and its `children` snippet instead of a children function.
- `useFilter` is a plain function. Call it in a `$derived` when its options change. `useFilteredItems` returns `{ current }`.
- Labels in `items`, the `placeholder`, and the text `itemToStringLabel` returns are strings. Format richer content with the `Combobox.Value` `children` snippet.
- `actionsRef` is not available. Use `bind:this` on `Combobox.Root`, which exposes `close()` and `unmount()`.
- `inputRef`, `virtualized` and the `Combobox.Item` `index` prop are not available. A `multiple` combobox submits through one hidden `<select multiple>` instead of one hidden input per value. `FormData` holds the same entries.
- A native form reset restores `defaultValue` and the input text, as the other form controls do. React Base UI keeps its state.
- `readonly` and `autocomplete` use the HTML spelling, so the root takes `readonly`, not `readOnly`. Handlers use lowercase names such as `onclick`. Call `event.preventDefault()` in a part's handler to skip the part's own handling.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Combobox.Root` renders no element, so it has no `render`.

## API reference

### Root

<ApiPart name="combobox" part="Root" />

`Combobox.Root` renders no element of its own, only the hidden inputs a form submits, so it has no data attributes.

### Label

<ApiPart name="combobox" part="Label" />

### InputGroup

<ApiPart name="combobox" part="InputGroup" />

| Attribute          | Description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `data-popup-open`  | Present when the popup is open.                                            |
| `data-pressed`     | Present while the popup is open.                                           |
| `data-disabled`    | Present when the combobox is disabled.                                     |
| `data-readonly`    | Present when the combobox is read-only.                                    |
| `data-popup-side`  | The side of the anchor the popup is on, while the popup is mounted.        |
| `data-list-empty`  | Present when the filtered list has no items.                               |
| `data-placeholder` | Present when nothing is selected.                                          |
| `data-valid`       | Present when the combobox is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`     | Present when the combobox is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`       | Present when the value has changed. Needs a `Field.Root` ancestor.         |
| `data-touched`     | Present when the combobox has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`      | Present when the combobox has a value. Needs a `Field.Root` ancestor.      |
| `data-focused`     | Present when the combobox is focused. Needs a `Field.Root` ancestor.       |

### Input

<ApiPart name="combobox" part="Input" />

| Attribute         | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `data-popup-open` | Present when the popup is open.                                            |
| `data-pressed`    | Present while the popup is open.                                           |
| `data-disabled`   | Present when the combobox is disabled.                                     |
| `data-readonly`   | Present when the combobox is read-only.                                    |
| `data-required`   | Present when the combobox is required.                                     |
| `data-popup-side` | The side of the anchor the popup is on, while the popup is mounted.        |
| `data-list-empty` | Present when the filtered list has no items.                               |
| `data-valid`      | Present when the combobox is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`    | Present when the combobox is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`      | Present when the value has changed. Needs a `Field.Root` ancestor.         |
| `data-touched`    | Present when the combobox has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`     | Present when the combobox has a value. Needs a `Field.Root` ancestor.      |
| `data-focused`    | Present when the input is focused. Needs a `Field.Root` ancestor.          |

### Trigger

<ApiPart name="combobox" part="Trigger" />

| Attribute          | Description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `data-popup-open`  | Present when the popup is open.                                            |
| `data-pressed`     | Present while the popup is open.                                           |
| `data-disabled`    | Present when the combobox is disabled.                                     |
| `data-readonly`    | Present when the combobox is read-only.                                    |
| `data-required`    | Present when the combobox is required.                                     |
| `data-popup-side`  | The side of the anchor the popup is on, while the popup is mounted.        |
| `data-list-empty`  | Present when the filtered list has no items.                               |
| `data-placeholder` | Present when nothing is selected.                                          |
| `data-valid`       | Present when the combobox is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`     | Present when the combobox is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`       | Present when the value has changed. Needs a `Field.Root` ancestor.         |
| `data-touched`     | Present when the combobox has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`      | Present when the combobox has a value. Needs a `Field.Root` ancestor.      |
| `data-focused`     | Present when the trigger is focused. Needs a `Field.Root` ancestor.        |

### Value

<ApiPart name="combobox" part="Value" />

### Icon

<ApiPart name="combobox" part="Icon" />

### Clear

<ApiPart name="combobox" part="Clear" />

| Attribute             | Description                               |
| --------------------- | ----------------------------------------- |
| `data-popup-open`     | Present when the popup is open.           |
| `data-disabled`       | Present when the button is disabled.      |
| `data-visible`        | Present when there is something to clear. |
| `data-starting-style` | Present when the button is animating in.  |
| `data-ending-style`   | Present when the button is animating out. |

### Chips

<ApiPart name="combobox" part="Chips" />

### Chip

<ApiPart name="combobox" part="Chip" />

| Attribute       | Description                            |
| --------------- | -------------------------------------- |
| `data-disabled` | Present when the combobox is disabled. |

### ChipRemove

<ApiPart name="combobox" part="ChipRemove" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

### Portal

<ApiPart name="combobox" part="Portal" />

### Backdrop

<ApiPart name="combobox" part="Backdrop" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-open`           | Present when the popup is open.          |
| `data-closed`         | Present when the popup is closed.        |
| `data-starting-style` | Present when the popup is animating in.  |
| `data-ending-style`   | Present when the popup is animating out. |

### Positioner

<ApiPart name="combobox" part="Positioner" />

| Attribute            | Description                                  |
| -------------------- | -------------------------------------------- |
| `data-open`          | Present when the popup is open.              |
| `data-closed`        | Present when the popup is closed.            |
| `data-anchor-hidden` | Present when the anchor is hidden.           |
| `data-side`          | The side of the anchor the popup is on.      |
| `data-align`         | How the popup lines up with the anchor.      |
| `data-empty`         | Present when the filtered list has no items. |

| CSS variable         | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `--anchor-width`     | The width of the anchor.                                    |
| `--anchor-height`    | The height of the anchor.                                   |
| `--available-width`  | The width between the anchor and the edge of the viewport.  |
| `--available-height` | The height between the anchor and the edge of the viewport. |
| `--transform-origin` | The point the popup grows from, for scale animations.       |

### Popup

<ApiPart name="combobox" part="Popup" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-open`           | Present when the popup is open.              |
| `data-closed`         | Present when the popup is closed.            |
| `data-side`           | The side of the anchor the popup is on.      |
| `data-align`          | How the popup lines up with the anchor.      |
| `data-anchor-hidden`  | Present when the anchor is hidden.           |
| `data-empty`          | Present when the filtered list has no items. |
| `data-starting-style` | Present when the popup is animating in.      |
| `data-ending-style`   | Present when the popup is animating out.     |

### Arrow

<ApiPart name="combobox" part="Arrow" />

| Attribute         | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `data-open`       | Present when the popup is open.                                  |
| `data-closed`     | Present when the popup is closed.                                |
| `data-side`       | The side of the anchor the popup is on.                          |
| `data-align`      | How the popup lines up with the anchor.                          |
| `data-uncentered` | Present when the arrow cannot point at the center of the anchor. |

### Status

<ApiPart name="combobox" part="Status" />

### Empty

<ApiPart name="combobox" part="Empty" />

### List

<ApiPart name="combobox" part="List" />

| Attribute    | Description                                  |
| ------------ | -------------------------------------------- |
| `data-empty` | Present when the filtered list has no items. |

### Collection

<ApiPart name="combobox" part="Collection" />

### Row

<ApiPart name="combobox" part="Row" />

### Item

<ApiPart name="combobox" part="Item" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-selected`    | Present when the item is selected.    |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### ItemIndicator

<ApiPart name="combobox" part="ItemIndicator" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-selected`       | Present when the item is selected.           |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |

### Group

<ApiPart name="combobox" part="Group" />

### GroupLabel

<ApiPart name="combobox" part="GroupLabel" />

### Separator

<ApiPart name="combobox" part="Separator" />
