---
title: Autocomplete
description: An input that suggests options as you type, where the typed text is the value.
---

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	const tags = ['bug', 'docs', 'feature', 'fix', 'performance', 'refactor', 'security', 'test'];
</script>

<Autocomplete.Root items={tags}>
	<div class="flex flex-col gap-1 text-sm text-gray-900 dark:text-gray-100">
		<label for="tag-input" class="font-medium">Search tags</label>
		<Autocomplete.Input
			id="tag-input"
			placeholder="e.g. feature"
			class="h-10 w-64 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base outline-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
		/>
	</div>
	<Autocomplete.Portal>
		<Autocomplete.Positioner class="z-10 outline-none" sideOffset={4}>
			<Autocomplete.Popup
				class="max-h-[min(var(--available-height),20rem)] w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Autocomplete.Empty class="px-4 py-2 text-sm text-gray-600 empty:hidden dark:text-gray-400">
					No tags found.
				</Autocomplete.Empty>
				<Autocomplete.List>
					<Autocomplete.Collection>
						{#snippet children(tag: string)}
							<Autocomplete.Item
								value={tag}
								class="cursor-default px-4 py-2 text-sm leading-4 outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
							>
								{tag}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
</script>

<Autocomplete.Root>
	<Autocomplete.InputGroup>
		<Autocomplete.Input />
		<Autocomplete.Clear />
		<Autocomplete.Trigger>
			<Autocomplete.Value />
			<Autocomplete.Icon />
		</Autocomplete.Trigger>
	</Autocomplete.InputGroup>
	<Autocomplete.Portal>
		<Autocomplete.Backdrop />
		<Autocomplete.Positioner>
			<Autocomplete.Popup>
				<Autocomplete.Arrow />
				<Autocomplete.Status />
				<Autocomplete.Empty />
				<Autocomplete.List>
					<Autocomplete.Row>
						<Autocomplete.Item />
					</Autocomplete.Row>
					<Autocomplete.Separator />
					<Autocomplete.Group>
						<Autocomplete.GroupLabel />
						<Autocomplete.Collection />
					</Autocomplete.Group>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

`Autocomplete.Input`, `Autocomplete.Positioner` and `Autocomplete.Popup` are the usual minimum. Unlike a [Combobox](/components/combobox), an autocomplete keeps no selection: the text in the input is its value, and choosing an item fills the input with that item's text.

## Examples

### Bind the value

Bind `value` to read and change the text in the input. Without `bind:`, the autocomplete manages its own text, and `defaultValue` sets the text it starts from and the text a form reset restores. `onValueChange` runs before every change, and `eventDetails.cancel()` keeps the current text.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	const cities = ['Amsterdam', 'Berlin', 'Lisbon', 'Madrid', 'Paris', 'Rome', 'Vienna'];
	let query = $state('');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Autocomplete.Root items={cities} bind:value={query}>
		<Autocomplete.Input
			aria-label="City"
			class="h-10 w-56 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
		/>
		<Autocomplete.Portal>
			<Autocomplete.Positioner class="z-10" sideOffset={4}>
				<Autocomplete.Popup
					class="w-[var(--anchor-width)] rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
				>
					<Autocomplete.List>
						<Autocomplete.Collection>
							{#snippet children(item: string)}
								<Autocomplete.Item
									value={item}
									class="cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
								>
									{item}
								</Autocomplete.Item>
							{/snippet}
						</Autocomplete.Collection>
					</Autocomplete.List>
				</Autocomplete.Popup>
			</Autocomplete.Positioner>
		</Autocomplete.Portal>
	</Autocomplete.Root>
	<button
		type="button"
		class="rounded-md border border-gray-200 px-3 py-1.5 dark:border-gray-700"
		onclick={() => (query = '')}
	>
		Clear
	</button>
	<p>Query: "{query}"</p>
</div>
```

### Modes and inline completion

`mode` decides how the list follows the text and whether the input completes inline:

| Mode     | Filters the items | Completes inline |
| -------- | ----------------- | ---------------- |
| `list`   | Yes               | No               |
| `both`   | Yes               | Yes              |
| `inline` | No                | Yes              |
| `none`   | No                | No               |

With inline completion, the arrow keys write the highlighted item's text into the input while the list keeps filtering by what you typed. Typing again, or a change of `value` from outside, replaces the completion. The mode is reflected on the input as `aria-autocomplete`.

`autoHighlight` highlights the first match as you type, and `autoHighlight="always"` keeps a highlight while the list has items. `openOnInputClick` opens the popup when the input is clicked, which is off by default.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';

	const commands = ['checkout', 'cherry-pick', 'clone', 'commit', 'config', 'diff', 'fetch'];
</script>

<Autocomplete.Root items={commands} mode="both">
	<Autocomplete.Input
		aria-label="Git command"
		placeholder="Type c, then press ArrowDown"
		class="h-10 w-72 rounded-md border border-gray-200 bg-gray-50 px-3.5 font-mono text-base text-gray-900 outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	/>
	<Autocomplete.Portal>
		<Autocomplete.Positioner class="z-10" sideOffset={4}>
			<Autocomplete.Popup
				class="w-[var(--anchor-width)] rounded-md bg-gray-50 py-1 font-mono text-sm text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Autocomplete.List>
					<Autocomplete.Collection>
						{#snippet children(item: string)}
							<Autocomplete.Item
								value={item}
								class="cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
							>
								{item}
							</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Items and filtering

Pass the items to the root's `items` and render them with `Autocomplete.Collection` inside `Autocomplete.List`. Items can be strings, `{ value }` or `{ label }` objects, or groups of `{ value, items }`. For other objects, `itemToStringValue` gives the text the filter matches and the input takes when the item is chosen. The root infers the item type from `items`, so `itemToStringValue` and `onItemHighlighted` receive typed items.

`filter` replaces the matching function, and `filter={null}` turns filtering off. `Autocomplete.useFilter()` returns collator-based `contains`, `startsWith` and `endsWith` functions that honor the locale. To filter yourself, pass the result to `filteredItems`. `limit` caps how many matches render. Inside the root, `Autocomplete.useFilteredItems()` returns the filtered items as `{ current }`.

### Use with a field and form

Wrap the autocomplete in `Field.Root` to label, describe and validate it. The input itself carries the name and submits the text, so a plain `<form>` submits it too, and `required` blocks an empty submit with a `valueMissing` error. Any text is a valid value, not only the text of an item.

```svelte demo
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';

	const tags = ['bug', 'docs', 'feature', 'fix', 'refactor'];
	let submitted = $state('');
</script>

<Form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onFormSubmit={(values) => (submitted = JSON.stringify(values))}
>
	<Field.Root name="tag" class="flex flex-col items-start gap-1">
		<Field.Label class="font-medium">Tag</Field.Label>
		<Autocomplete.Root items={tags} required>
			<Autocomplete.Input
				placeholder="Type a tag"
				class="h-10 w-56 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base outline-none focus-visible:outline-2 focus-visible:outline-blue-800 data-[invalid]:border-red-600 dark:border-gray-700 dark:bg-gray-900"
			/>
			<Autocomplete.Portal>
				<Autocomplete.Positioner class="z-10" sideOffset={4}>
					<Autocomplete.Popup
						class="w-[var(--anchor-width)] rounded-md bg-gray-50 py-1 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
					>
						<Autocomplete.List>
							<Autocomplete.Collection>
								{#snippet children(item: string)}
									<Autocomplete.Item
										value={item}
										class="cursor-default px-4 py-2 outline-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900"
									>
										{item}
									</Autocomplete.Item>
								{/snippet}
							</Autocomplete.Collection>
						</Autocomplete.List>
					</Autocomplete.Popup>
				</Autocomplete.Positioner>
			</Autocomplete.Portal>
		</Autocomplete.Root>
		<Field.Error class="text-red-700 dark:text-red-400" />
	</Field.Root>
	<button type="submit" class="rounded-md border border-gray-200 px-3 py-1.5 dark:border-gray-700">
		Submit
	</button>
	<p>Submitted: {submitted || 'nothing yet'}</p>
</Form>
```

`submitOnItemClick` submits the form when an item is chosen with a click or Enter, for a search box that runs on selection.

### Input inside the popup

Put `Autocomplete.Input` inside `Autocomplete.Popup` and open it with `Autocomplete.Trigger`. `Autocomplete.Value` shows the current text in the trigger, and its `children` snippet receives that text to format it.

```svelte
<Autocomplete.Root items={tags}>
	<Autocomplete.Trigger>
		<Autocomplete.Value>
			{#snippet children(text)}
				{text || 'Search tags'}
			{/snippet}
		</Autocomplete.Value>
	</Autocomplete.Trigger>
	<Autocomplete.Portal>
		<Autocomplete.Positioner>
			<Autocomplete.Popup>
				<Autocomplete.Input placeholder="Search" />
				<Autocomplete.List>…</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

### Virtualized lists

Set `virtualized` on the root and give each rendered `Autocomplete.Item` its position in the filtered items as `index`, as in [Combobox](/components/combobox#virtualized-lists). The arrow keys move through every position, also past the rendered window, and `onItemHighlighted` reports the `index` to scroll to.

## Differences from Base UI

- `value` and `open` are bindable props. Use `bind:value` and `bind:open` instead of a value and its change callback together. `defaultValue` stays, because the autocomplete is a form control. There is no `defaultOpen`: pass `open` without `bind:` to set the initial state.
- `onValueChange` and `onOpenChange` run before the state changes. Call `eventDetails.cancel()` to keep the current state. Setting a bound prop yourself calls neither of them.
- `Autocomplete.List` takes static children. Render the filtered items with `Autocomplete.Collection` and its `children` snippet instead of a children function.
- `Autocomplete.Value` takes a `children` snippet that receives the text, in place of a children function.
- The root infers the item type from `items`, so it takes no type argument.
- `useFilter` is a plain function. Call it in a `$derived` when its options change. `useFilteredItems` returns `{ current }`.
- `actionsRef` is not available. Use `bind:this` on `Autocomplete.Root`, which exposes `close()` and `unmount()`.
- `inputRef` is not available.
- A native form reset restores `defaultValue`, as the other form controls do. React Base UI keeps its state.
- `readonly` uses the HTML spelling, so the root takes `readonly`, not `readOnly`. Handlers use lowercase names such as `onclick`. Call `event.preventDefault()` in a part's handler to skip the part's own handling.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Autocomplete.Root` renders no element, so it has no `render`.
- The parts Autocomplete shares with Combobox are the Combobox components, so their reference below lists Combobox types.

## API reference

### Root

<ApiPart name="autocomplete" part="Root" />

`Autocomplete.Root` renders no element of its own, so it has no data attributes.

### InputGroup

<ApiPart name="autocomplete" part="InputGroup" />

| Attribute         | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `data-popup-open` | Present when the popup is open.                                                |
| `data-pressed`    | Present while the popup is open.                                               |
| `data-disabled`   | Present when the autocomplete is disabled.                                     |
| `data-readonly`   | Present when the autocomplete is read-only.                                    |
| `data-popup-side` | The side of the anchor the popup is on, while the popup is mounted.            |
| `data-list-empty` | Present when the filtered list has no items.                                   |
| `data-valid`      | Present when the autocomplete is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`    | Present when the autocomplete is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`      | Present when the text has changed. Needs a `Field.Root` ancestor.              |
| `data-touched`    | Present when the autocomplete has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`     | Present when the input has text. Needs a `Field.Root` ancestor.                |
| `data-focused`    | Present when the autocomplete is focused. Needs a `Field.Root` ancestor.       |

### Input

<ApiPart name="autocomplete" part="Input" />

| Attribute         | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `data-popup-open` | Present when the popup is open.                                                |
| `data-pressed`    | Present while the popup is open.                                               |
| `data-disabled`   | Present when the autocomplete is disabled.                                     |
| `data-readonly`   | Present when the autocomplete is read-only.                                    |
| `data-required`   | Present when the autocomplete is required.                                     |
| `data-popup-side` | The side of the anchor the popup is on, while the popup is mounted.            |
| `data-list-empty` | Present when the filtered list has no items.                                   |
| `data-valid`      | Present when the autocomplete is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`    | Present when the autocomplete is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`      | Present when the text has changed. Needs a `Field.Root` ancestor.              |
| `data-touched`    | Present when the autocomplete has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`     | Present when the input has text. Needs a `Field.Root` ancestor.                |
| `data-focused`    | Present when the input is focused. Needs a `Field.Root` ancestor.              |

### Trigger

<ApiPart name="autocomplete" part="Trigger" />

| Attribute         | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `data-popup-open` | Present when the popup is open.                                                |
| `data-pressed`    | Present while the popup is open.                                               |
| `data-disabled`   | Present when the autocomplete is disabled.                                     |
| `data-readonly`   | Present when the autocomplete is read-only.                                    |
| `data-required`   | Present when the autocomplete is required.                                     |
| `data-popup-side` | The side of the anchor the popup is on, while the popup is mounted.            |
| `data-list-empty` | Present when the filtered list has no items.                                   |
| `data-valid`      | Present when the autocomplete is valid. Needs a `Field.Root` ancestor.         |
| `data-invalid`    | Present when the autocomplete is invalid. Needs a `Field.Root` ancestor.       |
| `data-dirty`      | Present when the text has changed. Needs a `Field.Root` ancestor.              |
| `data-touched`    | Present when the autocomplete has been touched. Needs a `Field.Root` ancestor. |
| `data-filled`     | Present when the input has text. Needs a `Field.Root` ancestor.                |
| `data-focused`    | Present when the trigger is focused. Needs a `Field.Root` ancestor.            |

### Value

<ApiPart name="autocomplete" part="Value" />

### Icon

<ApiPart name="autocomplete" part="Icon" />

### Clear

<ApiPart name="autocomplete" part="Clear" />

| Attribute             | Description                               |
| --------------------- | ----------------------------------------- |
| `data-popup-open`     | Present when the popup is open.           |
| `data-disabled`       | Present when the button is disabled.      |
| `data-visible`        | Present when there is something to clear. |
| `data-starting-style` | Present when the button is animating in.  |
| `data-ending-style`   | Present when the button is animating out. |

### Portal

<ApiPart name="autocomplete" part="Portal" />

### Backdrop

<ApiPart name="autocomplete" part="Backdrop" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-open`           | Present when the popup is open.          |
| `data-closed`         | Present when the popup is closed.        |
| `data-starting-style` | Present when the popup is animating in.  |
| `data-ending-style`   | Present when the popup is animating out. |

### Positioner

<ApiPart name="autocomplete" part="Positioner" />

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

<ApiPart name="autocomplete" part="Popup" />

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

<ApiPart name="autocomplete" part="Arrow" />

| Attribute         | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `data-open`       | Present when the popup is open.                                  |
| `data-closed`     | Present when the popup is closed.                                |
| `data-side`       | The side of the anchor the popup is on.                          |
| `data-align`      | How the popup lines up with the anchor.                          |
| `data-uncentered` | Present when the arrow cannot point at the center of the anchor. |

### Status

<ApiPart name="autocomplete" part="Status" />

### Empty

<ApiPart name="autocomplete" part="Empty" />

### List

<ApiPart name="autocomplete" part="List" />

| Attribute    | Description                                  |
| ------------ | -------------------------------------------- |
| `data-empty` | Present when the filtered list has no items. |

### Collection

<ApiPart name="autocomplete" part="Collection" />

### Row

<ApiPart name="autocomplete" part="Row" />

### Item

<ApiPart name="autocomplete" part="Item" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### Group

<ApiPart name="autocomplete" part="Group" />

### GroupLabel

<ApiPart name="autocomplete" part="GroupLabel" />

### Separator

<ApiPart name="autocomplete" part="Separator" />
