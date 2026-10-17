# Autocomplete

<Subtitle>
  An input that suggests options as you type.
</Subtitle>

<Meta name="description" content="An input that suggests options as you type." />

<DemoAutocompleteHero />

## Usage guidelines

- **Avoid when selection state is needed**: Use [Combobox](/components/combobox) instead of Autocomplete if the selection should be remembered and the input value cannot be custom. Unlike Combobox, Autocomplete's input can contain free-form text, as its suggestions only _optionally_ autocomplete the text.
- **Can be used for filterable command pickers**: The input can be used as a filter for command items that perform an action when clicked when rendered inside the popup.
- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [Manual unmounting](/handbook/animation#manual-unmounting) for animating it with a JavaScript library and for manual control.

## Anatomy

Import the components and place them together:

```svelte title="Anatomy"
<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
</script>

<Autocomplete.Root>
	<Autocomplete.InputGroup>
		<Autocomplete.Input />
		<Autocomplete.Trigger />
		<Autocomplete.Icon />
		<Autocomplete.Clear />
		<Autocomplete.Value />
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
					</Autocomplete.Group>

					<Autocomplete.Collection />
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
```

## Item values

Each `<Autocomplete.Item>` takes a `value` prop identifying it. Pass the item being rendered, so that props like `itemToStringValue` receive it.

## Examples

### Async search

Load items asynchronously while typing and render custom status content.

<DemoAutocompleteAsync />

### Inline autocomplete

Autofill the input with the highlighted item while navigating with arrow keys using the `mode` prop. Accepts `aria-autocomplete` values `list`, `both`, `inline`, or `none`.

<DemoAutocompleteInline />

### Grouped

Organize related options with `<Autocomplete.Group>` and `<Autocomplete.GroupLabel>` to add section headings inside the popup.

Groups are represented by an array of objects with an `items` property, which itself is an array of individual items for each group. An extra property, such as `value`, can be provided for the heading text when rendering the group label.

```ts title="Example"
interface ProduceGroupItem {
	value: string;
	// @highlight
	items: string[];
}

const groups: ProduceGroupItem[] = [
	{
		value: 'Fruits',
		// @highlight
		items: ['Apple', 'Banana', 'Orange']
	},
	{
		value: 'Vegetables',
		// @highlight
		items: ['Carrot', 'Lettuce', 'Spinach']
	}
];
```

<DemoAutocompleteGrouped />

### Fuzzy matching

Use fuzzy matching to find relevant results even when the query doesn't exactly match the item text.

<DemoAutocompleteFuzzyMatching />

### Limit results

Limit the number of visible items using the `limit` prop and guide users to refine their query using `<Autocomplete.Status>`.

<DemoAutocompleteLimit />

### Auto highlight

The first matching item can be automatically highlighted as the user types by specifying the `autoHighlight` prop on `<Autocomplete.Root>`. Set the prop's value to `"always"` if the highlight should always be present, such as when the list is rendered inline within a dialog.

The prop can be combined with the `keepHighlight` and `highlightItemOnHover` props to configure how the highlight behaves during mouse interactions.

<DemoAutocompleteAutoHighlight />

### Command palette

Use the autocomplete input to filter a list of command items that perform an action when clicked.

<DemoAutocompleteCommandPalette />

### Grid layout

Display items in a grid layout, wrapping each row in `<Autocomplete.Row>` components.

<DemoAutocompleteGrid />

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/svelte-virtual`.

<DemoAutocompleteVirtualized />

#### Memoizing items

Memoizing each item is a React technique for datasets up to roughly 1,000 items, and Svelte needs no equivalent. `<Autocomplete.Collection>` keeps the item for each unchanged value, so unchanged items skip re-rendering while the user types. While this speeds up typing, it does not speed up opening; with a large enough number of items, the mount cost dominates, and virtualization becomes necessary to keep the open interaction fast on low-end devices.

```svelte title="Memoizing list items"
<script lang="ts">
	interface Suggestion {
		id: string;
		label: string;
		description: string;
	}
</script>

<Autocomplete.List>
	<Autocomplete.Collection>
		{#snippet children(item: Suggestion)}
			<Autocomplete.Item value={item}>
				<span>{item.label}</span>
				<span>{item.description}</span>
			</Autocomplete.Item>
		{/snippet}
	</Autocomplete.Collection>
</Autocomplete.List>
```

## API reference

<script>
	import { DemoAutocompleteHero } from './demos/hero';
	import { DemoAutocompleteAsync } from './demos/async';
	import { DemoAutocompleteInline } from './demos/inline';
	import { DemoAutocompleteGrouped } from './demos/grouped';
	import { DemoAutocompleteFuzzyMatching } from './demos/fuzzy-matching';
	import { DemoAutocompleteLimit } from './demos/limit';
	import { DemoAutocompleteAutoHighlight } from './demos/auto-highlight';
	import { DemoAutocompleteCommandPalette } from './demos/command-palette';
	import { DemoAutocompleteGrid } from './demos/grid';
	import { DemoAutocompleteVirtualized } from './demos/virtualized';
	import { TypesAutocomplete } from './types';
</script>

### Root

<TypesAutocomplete.Root />

### Value

<TypesAutocomplete.Value />

### Input

<TypesAutocomplete.Input />

### InputGroup

<TypesAutocomplete.InputGroup />

### Trigger

<TypesAutocomplete.Trigger />

### Icon

<TypesAutocomplete.Icon />

### Clear

<TypesAutocomplete.Clear />

### List

<TypesAutocomplete.List />

### Portal

<TypesAutocomplete.Portal />

### Backdrop

<TypesAutocomplete.Backdrop />

### Positioner

<TypesAutocomplete.Positioner />

### Popup

<TypesAutocomplete.Popup />

### Arrow

<TypesAutocomplete.Arrow />

### Status

<TypesAutocomplete.Status />

### Empty

<TypesAutocomplete.Empty />

### Collection

<TypesAutocomplete.Collection />

### Row

<TypesAutocomplete.Row />

### Item

<TypesAutocomplete.Item />

### Group

<TypesAutocomplete.Group />

### GroupLabel

<TypesAutocomplete.GroupLabel />

### Separator

<TypesAutocomplete.Separator />

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This function is used when externally filtering items.
`Autocomplete.useFilter` is a plain function, so call it in a `$derived` when its options change.

**Parameters**

| Parameter  | Type                        | Default | Description                 |
| ---------- | --------------------------- | ------- | --------------------------- |
| `options?` | `AutocompleteFilterOptions` | `{}`    | Options for the comparison. |

`AutocompleteFilterOptions`

| Prop       | Type                   | Description                                                                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `locale`   | `Intl.LocalesArgument` | The locale to use for string comparison. Defaults to the user's runtime locale. Any `Intl.CollatorOptions` are accepted too. |
| `multiple` | `boolean`              | Whether several values are selected. Defaults to `false`.                                                                    |
| `value`    | `unknown`              | The selected value. In single mode, `contains` matches every item while the query equals this value's label.                 |

**Return value**

`AutocompleteFilter`

| Property     | Type                                                                                  | Description                                          |
| ------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `contains`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item matches the query anywhere. |
| `startsWith` | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item starts with the query.      |
| `endsWith`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item ends with the query.        |

```svelte
<script lang="ts">
	const { contains } = Autocomplete.useFilter({ locale: 'de' });
</script>

<Autocomplete.Root items={countries} filter={contains} />
```

## useFilteredItems

Returns the internally filtered items when called inside `<Autocomplete.Root>`.
Treat the result as read-only: it is internal state and may be a shared frozen array.
Call it while a component inside the root initializes.

**Return value**

`{ readonly current: readonly Item[] }`

| Property  | Type              | Modifiers | Description                                          |
| --------- | ----------------- | --------- | ---------------------------------------------------- |
| `current` | `readonly Item[]` | readonly  | The filtered items. It updates as the query changes. |
