# Combobox

<Subtitle>
  An input combined with a list of predefined items to select.
</Subtitle>

<Meta name="description" content="An input combined with a list of predefined items to select." />

<DemoComboboxHero />

## Usage guidelines

- **Combobox is a filterable Select**: Use Combobox when the input is restricted to a set of predefined selectable items, similar to [Select](/components/select) but whose items are filterable using an input. Prefer using Combobox over Select when the number of items is sufficiently large to warrant filtering.
- **Avoid for simple search widgets**: Combobox does not allow free-form text input. For search widgets, consider using [Autocomplete](/components/autocomplete) instead.
- **Avoid when not rendering an input**: Use [Select](/components/select) instead of Combobox if no input is being rendered, which includes accessibility features specific to a listbox without an input.
- **Form controls must have an accessible name**: If `<Combobox.Input>` is the form control, label it with a native `<label>` or `<Field.Label>`, or provide an `aria-label` when no visible label is rendered. `<Combobox.Label>` labels `<Combobox.Trigger>` and is intended for the [input-inside-popup](#input-inside-popup) pattern, where the trigger is the form control. See the [forms guide](/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [Manual unmounting](/handbook/animation#manual-unmounting) for animating it with a JavaScript library and for manual control.

## Anatomy

Import the components and place them together:

```svelte title="Anatomy"
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
</script>

<Combobox.Root>
	<Combobox.Label />

	<Combobox.InputGroup>
		<Combobox.Input />
		<Combobox.Trigger />
		<Combobox.Icon />
		<Combobox.Clear />
		<Combobox.Value />

		<Combobox.Chips>
			<Combobox.Chip>
				<Combobox.ChipRemove />
			</Combobox.Chip>
		</Combobox.Chips>
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
					</Combobox.Group>

					<Combobox.Collection />
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

## Item values

Each `<Combobox.Item>` takes a `value` prop identifying it. Pass the item being rendered. `<Combobox.List>` takes static children in Svelte, so render the items with `<Combobox.Collection>`, whose `children` snippet receives each item:

```svelte title="Using item objects as values"
<Combobox.List>
	<Combobox.Collection>
		{#snippet children(item: Item)}
			<Combobox.Item value={item}>
				{item.label}
			</Combobox.Item>
		{/snippet}
	</Combobox.Collection>
</Combobox.List>
```

That item is what `value`, `defaultValue`, and `onValueChange` receive. To store IDs instead, see [Value selection with IDs](#value-selection-with-ids).

## Examples

### Typed wrapper component

The following example shows a typed wrapper around the Combobox component with correct type inference and type safety. Each bindable prop of `<Combobox.Root>` is forwarded with `bind:`:

```svelte title="Specifying generic type parameters"
<script lang="ts" generics="Value, Multiple extends boolean | undefined = false, Item = Value">
	import { Combobox, type ComboboxRootProps } from '@sveltery/base/combobox';

	let {
		value = $bindable(),
		inputValue = $bindable(),
		open = $bindable(false),
		children,
		...props
	}: ComboboxRootProps<Value, Multiple, Item> = $props();
</script>

<Combobox.Root bind:value bind:inputValue bind:open {...props}>
	{@render children?.()}
</Combobox.Root>
```

The third `Item` type parameter is what lets the wrapper accept a `Combobox.createItems()` collection, whose rendered item type differs from its selection value. Omit it and a collection infers `Value` as the source item type, surfacing an error on `defaultValue` rather than on `items`.

### Value selection with IDs

When your app stores IDs rather than item objects, use `Combobox.createItems` with `getValue` and `getLabel` to derive each item's selection value and display label.

With static data, create the collection at module scope. The accessor parameters are inferred from `users`. Pass the derived ID to the `value` prop of `<Combobox.Item>`, not the item being rendered:

```svelte title="Using item IDs as values"
<script lang="ts" module>
	import { Combobox } from '@sveltery/base/combobox';

	const items = Combobox.createItems(users, {
		getValue: (user) => user.id,
		getLabel: (user) => user.name
	});
</script>

<Combobox.Root {items}>
	<Combobox.List>
		<Combobox.Collection>
			{#snippet children(user: User)}
				<Combobox.Item value={user.id}>
					{user.name}
				</Combobox.Item>
			{/snippet}
		</Combobox.Collection>
	</Combobox.List>
</Combobox.Root>
```

Selection props and events use the derived IDs, while list rendering continues to receive the original items. The derived label is also used for filtering and typeahead.

When the data is loaded or replaced at runtime, derive the collection from it so that it is rebuilt only when the data changes:

```svelte title="Creating a collection from dynamic data"
<script lang="ts">
	const items = $derived(
		Combobox.createItems(users, {
			getValue: (user) => user.id,
			getLabel: (user) => user.name
		})
	);
</script>
```

<DemoComboboxCreateItems />

As a rule of thumb, use primitive items for simple lists, object values when the selected record is useful application state, and `createItems()` when selection should use a stable primitive ID while rendering and filtering still use object records.

Stable IDs preserve item matching when an async data library replaces row objects during a refetch. With object values, use `isItemEqualToValue` to compare their IDs instead.

When results are filtered externally (for example, by a server-side search), `items` represents records known to the app, while `filteredItems` represents the current result window displayed in the popup. Pass source items rather than derived values to `filteredItems`, preserving the flat or grouped structure of `items`:

```svelte title="Displaying a window of async results"
<script lang="ts">
	const items = $derived(
		Combobox.createItems(knownUsers, {
			getValue: (user) => user.id,
			getLabel: (user) => user.name
		})
	);
</script>

<Combobox.Root {items} filteredItems={searchResults} bind:value={selectedUserId} />
```

Include the selected user's record in `knownUsers` so its label remains available when it is outside `searchResults`. Alternatively, provide `itemToStringLabel` when the label can be derived from the selected value alone.

### Multiple select

The combobox can allow multiple selections by adding the `multiple` prop to `<Combobox.Root>`.
Selection chips are rendered with `<Combobox.Chip>` inside the input that can be removed.

<DemoComboboxMultiple />

In order for screen readers to announce how to reach and remove the chips, add `aria-description` to `<Combobox.Chip>` and `<Combobox.Input>`, alongside the `aria-label` on `<Combobox.Chips>` and `<Combobox.ChipRemove>`.
Base UI does not ship these strings. Translate them together with the rest of your interface.

Visible chips can be limited by slicing the selected values rendered in `<Combobox.Value>`:

```svelte title="Limiting visible chips"
<script lang="ts">
	const CHIP_LIMIT = 3;
</script>

<Combobox.Value>
	{#snippet children(selected)}
		{@const selectedValue = selected as string[]}
		<!-- @highlight-start -->
		{@const visibleValue = selectedValue.slice(0, CHIP_LIMIT)}
		{@const hiddenCount = selectedValue.length - visibleValue.length}
		<!-- @highlight-end -->
		{#each visibleValue as item (item)}
			<Combobox.Chip aria-description="Press Backspace or Delete to remove">
				{item}
				<Combobox.ChipRemove aria-label="Remove {item}" />
			</Combobox.Chip>
		{/each}
		<!-- @highlight-start -->
		{#if hiddenCount > 0}
			<span>+{hiddenCount} more</span>
		{/if}
		<!-- @highlight-end -->
		<Combobox.Input
			aria-description={selectedValue.length > 0
				? `${selectedValue.length} selected. From the start of the input, press Left Arrow to focus the selected items`
				: undefined}
		/>
	{/snippet}
</Combobox.Value>
```

#### Keeping the filter after selection

In `multiple` mode, selecting an item clears the typed filter and closes the popup when the input is rendered outside it. To let users pick several results from one query, cancel the relevant change request.

Which request to cancel depends on the input's placement. When the input is outside the popup, cancel the `item-press` close request in `onOpenChange`. When it is inside, cancel the clear request in `onInputValueChange`, marked with `eventDetails.isItemPress`.

```svelte title="Input outside the popup"
<Combobox.Root
	multiple
	onOpenChange={(open, eventDetails) => {
		if (!open && eventDetails.reason === 'item-press') {
			eventDetails.cancel();
		}
	}}
>
	<!-- ... -->
</Combobox.Root>
```

```svelte title="Input inside the popup"
<Combobox.Root
	multiple
	onInputValueChange={(value, eventDetails) => {
		if (eventDetails.isItemPress) {
			eventDetails.cancel();
		}
	}}
>
	<!-- ... -->
</Combobox.Root>
```

The typed filter still resets once the popup closes.

### Input inside popup

`<Combobox.Input>` can be rendered inside `<Combobox.Popup>` to create a searchable select popup.

<DemoComboboxInputInsidePopup />

Use `<Combobox.Label>` to provide a visible label for the combobox trigger in this pattern:

```svelte title="Using Combobox.Label to label a combobox"
<Combobox.Root>
	<!-- @highlight -->
	<Combobox.Label>Favorite fruit</Combobox.Label>
	<!-- ... -->
</Combobox.Root>
```

`<Combobox.Label>` renders a `<div>`, so clicking it focuses the combobox trigger without opening the popup.

### Grouped

Organize related options with `<Combobox.Group>` and `<Combobox.GroupLabel>` to add section headings inside the popup.

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

<DemoComboboxGrouped />

### Async search (single)

Load items from a remote source by fetching on input changes. Keep the selected item in the `items` list so it remains available while new results stream in. This pattern avoids needing to load items upfront.

<DemoComboboxAsyncSingle />

### Async search (multiple)

Load items from a remote source by fetching on input changes while supporting multiple selections. Selected items remain available in the list while new matches stream in. This pattern avoids needing to load items upfront.

<DemoComboboxAsyncMultiple />

### Creatable

Create a new item when the filter matches no items, opening a creation `<Dialog>`.

<DemoComboboxCreatable />

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/svelte-virtual`.

<DemoComboboxVirtualized />

#### Memoizing items

Svelte updates only what changed, so items need no memoizing: `<Combobox.Collection>` keys each item by its value and reuses the components of unchanged items while the filter changes. This is enough for datasets up to roughly 1,000 items. While it speeds up typing, it does not speed up opening; with a large enough number of items, the mount cost dominates, and virtualization becomes necessary to keep the open interaction fast on low-end devices.

## API reference

<script>
	import { DemoComboboxHero } from './demos/hero';
	import { DemoComboboxCreateItems } from './demos/create-items';
	import { DemoComboboxMultiple } from './demos/multiple';
	import { DemoComboboxInputInsidePopup } from './demos/input-inside-popup';
	import { DemoComboboxGrouped } from './demos/grouped';
	import { DemoComboboxAsyncSingle } from './demos/async-single';
	import { DemoComboboxAsyncMultiple } from './demos/async-multiple';
	import { DemoComboboxCreatable } from './demos/creatable';
	import { DemoComboboxVirtualized } from './demos/virtualized';
	import { TypesCombobox } from './types';
</script>

### Root

<TypesCombobox.Root />

### Label

<TypesCombobox.Label />

### Value

<TypesCombobox.Value />

### Icon

<TypesCombobox.Icon />

### Input

<TypesCombobox.Input />

### InputGroup

<TypesCombobox.InputGroup />

### Clear

<TypesCombobox.Clear />

### Trigger

<TypesCombobox.Trigger />

### Chips

<TypesCombobox.Chips />

### Chip

<TypesCombobox.Chip />

### ChipRemove

<TypesCombobox.ChipRemove />

### List

<TypesCombobox.List />

### Portal

<TypesCombobox.Portal />

### Backdrop

<TypesCombobox.Backdrop />

### Positioner

<TypesCombobox.Positioner />

### Popup

<TypesCombobox.Popup />

### Arrow

<TypesCombobox.Arrow />

### Status

<TypesCombobox.Status />

### Empty

<TypesCombobox.Empty />

### Collection

<TypesCombobox.Collection />

### Row

<TypesCombobox.Row />

### Item

<TypesCombobox.Item />

### ItemIndicator

<TypesCombobox.ItemIndicator />

### Group

<TypesCombobox.Group />

### GroupLabel

<TypesCombobox.GroupLabel />

### Separator

<TypesCombobox.Separator />

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This function is used when externally filtering items.
Pass the result to the `filter` prop of `<Combobox.Root>`.
`Combobox.useFilter` is a plain function, so call it in a `$derived` when its options change.

**Parameters**

| Parameter  | Type                    | Default | Description                 |
| ---------- | ----------------------- | ------- | --------------------------- |
| `options?` | `ComboboxFilterOptions` | `{}`    | Options for the comparison. |

`ComboboxFilterOptions`

| Prop       | Type                   | Description                                                                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `locale`   | `Intl.LocalesArgument` | The locale to use for string comparison. Defaults to the user's runtime locale. Any `Intl.CollatorOptions` are accepted too. |
| `multiple` | `boolean`              | Whether the combobox selects several values. Defaults to `false`.                                                            |
| `value`    | `unknown`              | The selected value. In single mode, `contains` matches every item while the query equals this value's label.                 |

**Return value**

`ComboboxFilter`

| Property     | Type                                                                                  | Description                                          |
| ------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `contains`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item matches the query anywhere. |
| `startsWith` | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item starts with the query.      |
| `endsWith`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item ends with the query.        |

```svelte
<script lang="ts">
	const { contains } = Combobox.useFilter({ locale: 'de' });
</script>

<Combobox.Root items={countries} filter={contains} />
```

## useFilteredItems

Returns the internally filtered items when called inside `<Combobox.Root>`.
Treat the result as read-only: it is internal state and may be a shared frozen array.
Call it while a component inside the root initializes.

**Return value**

`{ readonly current: readonly Item[] }`

| Property  | Type              | Modifiers | Description                                          |
| --------- | ----------------- | --------- | ---------------------------------------------------- |
| `current` | `readonly Item[]` | readonly  | The filtered items. It updates as the query changes. |

## createItems

Normalizes items into a collection for the `items` prop of `<Combobox.Root>`, deriving each item's selection value and label before rendering.
Create a static collection at module scope and a dynamic one in a `$derived`.

**Parameters**

| Parameter | Type                                      | Default | Description                                                                                                                                                                      |
| --------- | ----------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`    | `ComboboxItemsData<Item> \| undefined`    | -       | The flat or grouped source items, or `undefined` while they are loading. Items cannot have an `items` array, which marks a group, and the data must not contain nullish entries. |
| `options` | `CreateComboboxItemsOptions<Item, Value>` | -       | Functions that derive each source item's selection value and display label.                                                                                                      |

`CreateComboboxItemsOptions<Item, Value>`

| Prop       | Type                     | Description                                                                                                              |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `getValue` | `(item: Item) => Value`  | Returns the primitive value that identifies the item, used as its selection value. Each item must derive a unique value. |
| `getLabel` | `(item: Item) => string` | Returns the label shown in the input and matched against the query.                                                      |

**Return value**

`ComboboxItemCollection<Item, Value>`

A collection whose selection value is the `getValue` function's return value. Pass it to the `items` prop of `<Combobox.Root>`.
