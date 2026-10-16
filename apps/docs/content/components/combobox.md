---
title: Combobox
description: An input combined with a list of predefined items to select.
---

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const id = $props.id();

	interface Fruit {
		label: string;
		value: string;
	}

	const fruits: Fruit[] = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Orange', value: 'orange' },
		{ label: 'Pineapple', value: 'pineapple' },
		{ label: 'Grape', value: 'grape' },
		{ label: 'Mango', value: 'mango' },
		{ label: 'Strawberry', value: 'strawberry' },
		{ label: 'Blueberry', value: 'blueberry' },
		{ label: 'Raspberry', value: 'raspberry' },
		{ label: 'Blackberry', value: 'blackberry' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Peach', value: 'peach' },
		{ label: 'Pear', value: 'pear' },
		{ label: 'Plum', value: 'plum' },
		{ label: 'Kiwi', value: 'kiwi' },
		{ label: 'Watermelon', value: 'watermelon' },
		{ label: 'Cantaloupe', value: 'cantaloupe' },
		{ label: 'Honeydew', value: 'honeydew' },
		{ label: 'Papaya', value: 'papaya' },
		{ label: 'Guava', value: 'guava' },
		{ label: 'Lychee', value: 'lychee' },
		{ label: 'Pomegranate', value: 'pomegranate' },
		{ label: 'Apricot', value: 'apricot' },
		{ label: 'Grapefruit', value: 'grapefruit' },
		{ label: 'Passionfruit', value: 'passionfruit' }
	];
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<Combobox.Root items={fruits}>
	<div
		class="relative flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
	>
		<label for={id}>Choose a fruit</label>
		<Combobox.InputGroup
			class="relative h-8 w-56 border border-neutral-950 bg-white dark:bg-neutral-950 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white [&>input]:pr-[calc(0.5rem+2rem)] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
		>
			<Combobox.Input
				placeholder="e.g. Apple"
				{id}
				class="h-full w-full border-0 bg-white pl-2 dark:bg-neutral-950 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
			/>
			<div
				class="absolute right-0 bottom-0 flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400"
			>
				<Combobox.Clear
					class="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Clear selection"
				>
					{@render XIcon()}
				</Combobox.Clear>
				<Combobox.Trigger
					class="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Open popup"
				>
					{@render CaretDownIcon()}
				</Combobox.Trigger>
			</div>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No fruits found.
					</div>
				</Combobox.Empty>
				<Combobox.List
					class="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0"
				>
					<Combobox.Collection>
						{#snippet children(item: Fruit)}
							<Combobox.Item
								value={item}
								class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
							>
								<Combobox.ItemIndicator class="col-start-1">
									{@render CheckIcon()}
								</Combobox.ItemIndicator>
								<span class="col-start-2">{item.label}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

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

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const id = $props.id();

	interface Fruit {
		id: string;
		name: string;
	}

	const fruits: Fruit[] = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'pineapple', name: 'Pineapple' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'mango', name: 'Mango' },
		{ id: 'strawberry', name: 'Strawberry' },
		{ id: 'blueberry', name: 'Blueberry' },
		{ id: 'raspberry', name: 'Raspberry' },
		{ id: 'blackberry', name: 'Blackberry' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'peach', name: 'Peach' },
		{ id: 'pear', name: 'Pear' },
		{ id: 'plum', name: 'Plum' },
		{ id: 'kiwi', name: 'Kiwi' },
		{ id: 'watermelon', name: 'Watermelon' }
	];

	const items = Combobox.createItems(fruits, {
		getValue: (fruit) => fruit.id,
		getLabel: (fruit) => fruit.name
	});
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<Combobox.Root {items} defaultValue="banana">
	<div
		class="relative flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
	>
		<label for={id}>Choose a fruit</label>
		<Combobox.InputGroup
			class="relative h-8 w-56 border border-neutral-950 bg-white dark:bg-neutral-950 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white [&>input]:pr-[calc(0.5rem+2rem)] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
		>
			<Combobox.Input
				placeholder="e.g. Apple"
				{id}
				class="h-full w-full border-0 bg-white pl-2 dark:bg-neutral-950 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
			/>
			<div
				class="absolute right-0 bottom-0 flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400"
			>
				<Combobox.Clear
					class="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Clear selection"
				>
					{@render XIcon()}
				</Combobox.Clear>
				<Combobox.Trigger
					class="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Open popup"
				>
					{@render CaretDownIcon()}
				</Combobox.Trigger>
			</div>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No fruits found.
					</div>
				</Combobox.Empty>
				<Combobox.List
					class="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0"
				>
					<Combobox.Collection>
						{#snippet children(item: Fruit)}
							<Combobox.Item
								value={item.id}
								class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
							>
								<Combobox.ItemIndicator class="col-start-1">
									{@render CheckIcon()}
								</Combobox.ItemIndicator>
								<span class="col-start-2">{item.name}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

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

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const id = $props.id();

	const chipProps = { 'aria-description': 'Press Backspace or Delete to remove' };

	function inputProps(selectedCount: number) {
		return {
			'aria-description':
				selectedCount > 0
					? `${selectedCount} selected. From the start of the input, press Left Arrow to focus the selected items`
					: undefined
		};
	}

	interface ProgrammingLanguage {
		id: string;
		value: string;
	}

	const langs: ProgrammingLanguage[] = [
		{ id: 'js', value: 'JavaScript' },
		{ id: 'ts', value: 'TypeScript' },
		{ id: 'py', value: 'Python' },
		{ id: 'java', value: 'Java' },
		{ id: 'cpp', value: 'C++' },
		{ id: 'cs', value: 'C#' },
		{ id: 'php', value: 'PHP' },
		{ id: 'ruby', value: 'Ruby' },
		{ id: 'go', value: 'Go' },
		{ id: 'rust', value: 'Rust' },
		{ id: 'swift', value: 'Swift' }
	];
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

<Combobox.Root items={langs} multiple>
	<div class="max-w-md flex flex-col gap-1">
		<label
			class="flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
			for={id}
		>
			Programming languages
		</label>
		<Combobox.InputGroup
			class="flex min-h-8 w-64 cursor-text flex-wrap items-center gap-0.5 border border-neutral-950 bg-white dark:bg-neutral-950 px-2 py-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white has-[button]:px-1 dark:border-white min-[32rem]:w-[22rem]"
		>
			<Combobox.Value>
				{#snippet children(selected)}
					{@const value = selected as ProgrammingLanguage[]}
					<Combobox.Chips
						class="flex w-full flex-wrap items-center gap-1"
						aria-label={value.length > 0 ? 'Selected languages' : undefined}
					>
						{#each value as language (language.id)}
							<Combobox.Chip
								class="group flex min-h-[calc(1.5rem-2px)] cursor-default items-center gap-1 overflow-hidden bg-neutral-100 py-0 pr-[0.2rem] pl-[0.4rem] text-sm leading-none text-neutral-950 outline-none focus-within:bg-neutral-950 focus-within:text-white [@media(hover:hover)]:data-highlighted:bg-neutral-950 [@media(hover:hover)]:data-highlighted:text-white dark:bg-neutral-800 dark:text-white dark:focus-within:bg-white dark:focus-within:text-neutral-950 dark:[@media(hover:hover)]:data-highlighted:bg-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950"
								aria-label={language.value}
								{...chipProps}
							>
								{language.value}
								<Combobox.ChipRemove
									class="flex size-4 items-center justify-center border-0 bg-transparent p-0 text-inherit hover:bg-neutral-200 group-focus-within:hover:bg-neutral-700 dark:hover:bg-neutral-700 dark:group-focus-within:hover:bg-neutral-200"
									aria-label="Remove {language.value}"
								>
									{@render XIcon()}
								</Combobox.ChipRemove>
							</Combobox.Chip>
						{/each}
						<Combobox.Input
							{id}
							placeholder={value.length > 0 ? '' : 'e.g. TypeScript'}
							{...inputProps(value.length)}
							class="h-[calc(1.5rem-2px)] min-w-12 flex-1 border-0 bg-white p-0 text-sm any-pointer-coarse:text-base dark:bg-neutral-950 font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
						/>
					</Combobox.Chips>
				{/snippet}
			</Combobox.Value>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="z-50 outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-h-[min(var(--available-height),24.5rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto overscroll-contain border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-2 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No languages found.
					</div>
				</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(language: ProgrammingLanguage)}
							<Combobox.Item
								value={language}
								class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-selected:relative data-selected:z-0 data-selected:text-neutral-950 data-selected:before:absolute data-selected:before:inset-0 data-selected:before:z-[-1] [@media(hover:hover)]:data-highlighted:relative [@media(hover:hover)]:data-highlighted:z-0 [@media(hover:hover)]:data-highlighted:text-white [@media(hover:hover)]:data-highlighted:before:absolute [@media(hover:hover)]:data-highlighted:before:inset-0 [@media(hover:hover)]:data-highlighted:before:z-[-1] [@media(hover:hover)]:data-highlighted:before:bg-neutral-950 dark:data-selected:text-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950 dark:[@media(hover:hover)]:data-highlighted:before:bg-white"
							>
								<Combobox.ItemIndicator class="col-start-1">
									{@render CheckIcon()}
								</Combobox.ItemIndicator>
								<span class="col-start-2">{language.value}</span>
							</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

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

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	interface Country {
		code: string;
		value: string;
		continent: string;
		label: string;
	}

	const countries: Country[] = [
		{ code: 'af', value: 'afghanistan', label: 'Afghanistan', continent: 'Asia' },
		{ code: 'al', value: 'albania', label: 'Albania', continent: 'Europe' },
		{ code: 'dz', value: 'algeria', label: 'Algeria', continent: 'Africa' },
		{ code: 'ad', value: 'andorra', label: 'Andorra', continent: 'Europe' },
		{ code: 'ao', value: 'angola', label: 'Angola', continent: 'Africa' },
		{ code: 'ar', value: 'argentina', label: 'Argentina', continent: 'South America' },
		{ code: 'am', value: 'armenia', label: 'Armenia', continent: 'Asia' },
		{ code: 'au', value: 'australia', label: 'Australia', continent: 'Oceania' },
		{ code: 'at', value: 'austria', label: 'Austria', continent: 'Europe' },
		{ code: 'az', value: 'azerbaijan', label: 'Azerbaijan', continent: 'Asia' },
		{ code: 'bs', value: 'bahamas', label: 'Bahamas', continent: 'North America' },
		{ code: 'bh', value: 'bahrain', label: 'Bahrain', continent: 'Asia' },
		{ code: 'bd', value: 'bangladesh', label: 'Bangladesh', continent: 'Asia' },
		{ code: 'bb', value: 'barbados', label: 'Barbados', continent: 'North America' },
		{ code: 'by', value: 'belarus', label: 'Belarus', continent: 'Europe' },
		{ code: 'be', value: 'belgium', label: 'Belgium', continent: 'Europe' },
		{ code: 'bz', value: 'belize', label: 'Belize', continent: 'North America' },
		{ code: 'bj', value: 'benin', label: 'Benin', continent: 'Africa' },
		{ code: 'bt', value: 'bhutan', label: 'Bhutan', continent: 'Asia' },
		{ code: 'bo', value: 'bolivia', label: 'Bolivia', continent: 'South America' },
		{
			code: 'ba',
			value: 'bosnia-and-herzegovina',
			label: 'Bosnia and Herzegovina',
			continent: 'Europe'
		},
		{ code: 'bw', value: 'botswana', label: 'Botswana', continent: 'Africa' },
		{ code: 'br', value: 'brazil', label: 'Brazil', continent: 'South America' },
		{ code: 'bn', value: 'brunei', label: 'Brunei', continent: 'Asia' },
		{ code: 'bg', value: 'bulgaria', label: 'Bulgaria', continent: 'Europe' },
		{ code: 'bf', value: 'burkina-faso', label: 'Burkina Faso', continent: 'Africa' },
		{ code: 'bi', value: 'burundi', label: 'Burundi', continent: 'Africa' },
		{ code: 'kh', value: 'cambodia', label: 'Cambodia', continent: 'Asia' },
		{ code: 'cm', value: 'cameroon', label: 'Cameroon', continent: 'Africa' },
		{ code: 'ca', value: 'canada', label: 'Canada', continent: 'North America' },
		{ code: 'cv', value: 'cape-verde', label: 'Cape Verde', continent: 'Africa' },
		{
			code: 'cf',
			value: 'central-african-republic',
			label: 'Central African Republic',
			continent: 'Africa'
		},
		{ code: 'td', value: 'chad', label: 'Chad', continent: 'Africa' },
		{ code: 'cl', value: 'chile', label: 'Chile', continent: 'South America' },
		{ code: 'cn', value: 'china', label: 'China', continent: 'Asia' },
		{ code: 'co', value: 'colombia', label: 'Colombia', continent: 'South America' },
		{ code: 'km', value: 'comoros', label: 'Comoros', continent: 'Africa' },
		{ code: 'cg', value: 'congo', label: 'Congo', continent: 'Africa' },
		{ code: 'cr', value: 'costa-rica', label: 'Costa Rica', continent: 'North America' },
		{ code: 'hr', value: 'croatia', label: 'Croatia', continent: 'Europe' },
		{ code: 'cu', value: 'cuba', label: 'Cuba', continent: 'North America' },
		{ code: 'cy', value: 'cyprus', label: 'Cyprus', continent: 'Asia' },
		{ code: 'cz', value: 'czech-republic', label: 'Czech Republic', continent: 'Europe' },
		{ code: 'dk', value: 'denmark', label: 'Denmark', continent: 'Europe' },
		{ code: 'dj', value: 'djibouti', label: 'Djibouti', continent: 'Africa' },
		{ code: 'dm', value: 'dominica', label: 'Dominica', continent: 'North America' },
		{
			code: 'do',
			value: 'dominican-republic',
			label: 'Dominican Republic',
			continent: 'North America'
		},
		{ code: 'ec', value: 'ecuador', label: 'Ecuador', continent: 'South America' },
		{ code: 'eg', value: 'egypt', label: 'Egypt', continent: 'Africa' },
		{ code: 'sv', value: 'el-salvador', label: 'El Salvador', continent: 'North America' },
		{ code: 'gq', value: 'equatorial-guinea', label: 'Equatorial Guinea', continent: 'Africa' },
		{ code: 'er', value: 'eritrea', label: 'Eritrea', continent: 'Africa' },
		{ code: 'ee', value: 'estonia', label: 'Estonia', continent: 'Europe' },
		{ code: 'et', value: 'ethiopia', label: 'Ethiopia', continent: 'Africa' },
		{ code: 'fj', value: 'fiji', label: 'Fiji', continent: 'Oceania' },
		{ code: 'fi', value: 'finland', label: 'Finland', continent: 'Europe' },
		{ code: 'fr', value: 'france', label: 'France', continent: 'Europe' },
		{ code: 'ga', value: 'gabon', label: 'Gabon', continent: 'Africa' },
		{ code: 'gm', value: 'gambia', label: 'Gambia', continent: 'Africa' },
		{ code: 'ge', value: 'georgia', label: 'Georgia', continent: 'Asia' },
		{ code: 'de', value: 'germany', label: 'Germany', continent: 'Europe' },
		{ code: 'gh', value: 'ghana', label: 'Ghana', continent: 'Africa' },
		{ code: 'gr', value: 'greece', label: 'Greece', continent: 'Europe' },
		{ code: 'gd', value: 'grenada', label: 'Grenada', continent: 'North America' },
		{ code: 'gt', value: 'guatemala', label: 'Guatemala', continent: 'North America' },
		{ code: 'gn', value: 'guinea', label: 'Guinea', continent: 'Africa' },
		{ code: 'gw', value: 'guinea-bissau', label: 'Guinea-Bissau', continent: 'Africa' },
		{ code: 'gy', value: 'guyana', label: 'Guyana', continent: 'South America' },
		{ code: 'ht', value: 'haiti', label: 'Haiti', continent: 'North America' },
		{ code: 'hn', value: 'honduras', label: 'Honduras', continent: 'North America' },
		{ code: 'hu', value: 'hungary', label: 'Hungary', continent: 'Europe' },
		{ code: 'is', value: 'iceland', label: 'Iceland', continent: 'Europe' },
		{ code: 'in', value: 'india', label: 'India', continent: 'Asia' },
		{ code: 'id', value: 'indonesia', label: 'Indonesia', continent: 'Asia' },
		{ code: 'ir', value: 'iran', label: 'Iran', continent: 'Asia' },
		{ code: 'iq', value: 'iraq', label: 'Iraq', continent: 'Asia' },
		{ code: 'ie', value: 'ireland', label: 'Ireland', continent: 'Europe' },
		{ code: 'il', value: 'israel', label: 'Israel', continent: 'Asia' },
		{ code: 'it', value: 'italy', label: 'Italy', continent: 'Europe' },
		{ code: 'jm', value: 'jamaica', label: 'Jamaica', continent: 'North America' },
		{ code: 'jp', value: 'japan', label: 'Japan', continent: 'Asia' },
		{ code: 'jo', value: 'jordan', label: 'Jordan', continent: 'Asia' },
		{ code: 'kz', value: 'kazakhstan', label: 'Kazakhstan', continent: 'Asia' },
		{ code: 'ke', value: 'kenya', label: 'Kenya', continent: 'Africa' },
		{ code: 'kw', value: 'kuwait', label: 'Kuwait', continent: 'Asia' },
		{ code: 'kg', value: 'kyrgyzstan', label: 'Kyrgyzstan', continent: 'Asia' },
		{ code: 'la', value: 'laos', label: 'Laos', continent: 'Asia' },
		{ code: 'lv', value: 'latvia', label: 'Latvia', continent: 'Europe' },
		{ code: 'lb', value: 'lebanon', label: 'Lebanon', continent: 'Asia' },
		{ code: 'ls', value: 'lesotho', label: 'Lesotho', continent: 'Africa' },
		{ code: 'lr', value: 'liberia', label: 'Liberia', continent: 'Africa' },
		{ code: 'ly', value: 'libya', label: 'Libya', continent: 'Africa' },
		{ code: 'li', value: 'liechtenstein', label: 'Liechtenstein', continent: 'Europe' },
		{ code: 'lt', value: 'lithuania', label: 'Lithuania', continent: 'Europe' },
		{ code: 'lu', value: 'luxembourg', label: 'Luxembourg', continent: 'Europe' },
		{ code: 'mg', value: 'madagascar', label: 'Madagascar', continent: 'Africa' },
		{ code: 'mw', value: 'malawi', label: 'Malawi', continent: 'Africa' },
		{ code: 'my', value: 'malaysia', label: 'Malaysia', continent: 'Asia' },
		{ code: 'mv', value: 'maldives', label: 'Maldives', continent: 'Asia' },
		{ code: 'ml', value: 'mali', label: 'Mali', continent: 'Africa' },
		{ code: 'mt', value: 'malta', label: 'Malta', continent: 'Europe' },
		{ code: 'mh', value: 'marshall-islands', label: 'Marshall Islands', continent: 'Oceania' },
		{ code: 'mr', value: 'mauritania', label: 'Mauritania', continent: 'Africa' },
		{ code: 'mu', value: 'mauritius', label: 'Mauritius', continent: 'Africa' },
		{ code: 'mx', value: 'mexico', label: 'Mexico', continent: 'North America' },
		{ code: 'fm', value: 'micronesia', label: 'Micronesia', continent: 'Oceania' },
		{ code: 'md', value: 'moldova', label: 'Moldova', continent: 'Europe' },
		{ code: 'mc', value: 'monaco', label: 'Monaco', continent: 'Europe' },
		{ code: 'mn', value: 'mongolia', label: 'Mongolia', continent: 'Asia' },
		{ code: 'me', value: 'montenegro', label: 'Montenegro', continent: 'Europe' },
		{ code: 'ma', value: 'morocco', label: 'Morocco', continent: 'Africa' },
		{ code: 'mz', value: 'mozambique', label: 'Mozambique', continent: 'Africa' },
		{ code: 'mm', value: 'myanmar', label: 'Myanmar', continent: 'Asia' },
		{ code: 'na', value: 'namibia', label: 'Namibia', continent: 'Africa' },
		{ code: 'nr', value: 'nauru', label: 'Nauru', continent: 'Oceania' },
		{ code: 'np', value: 'nepal', label: 'Nepal', continent: 'Asia' },
		{ code: 'nl', value: 'netherlands', label: 'Netherlands', continent: 'Europe' },
		{ code: 'nz', value: 'new-zealand', label: 'New Zealand', continent: 'Oceania' },
		{ code: 'ni', value: 'nicaragua', label: 'Nicaragua', continent: 'North America' },
		{ code: 'ne', value: 'niger', label: 'Niger', continent: 'Africa' },
		{ code: 'ng', value: 'nigeria', label: 'Nigeria', continent: 'Africa' },
		{ code: 'kp', value: 'north-korea', label: 'North Korea', continent: 'Asia' },
		{ code: 'mk', value: 'north-macedonia', label: 'North Macedonia', continent: 'Europe' },
		{ code: 'no', value: 'norway', label: 'Norway', continent: 'Europe' },
		{ code: 'om', value: 'oman', label: 'Oman', continent: 'Asia' },
		{ code: 'pk', value: 'pakistan', label: 'Pakistan', continent: 'Asia' },
		{ code: 'pw', value: 'palau', label: 'Palau', continent: 'Oceania' },
		{ code: 'ps', value: 'palestine', label: 'Palestine', continent: 'Asia' },
		{ code: 'pa', value: 'panama', label: 'Panama', continent: 'North America' },
		{ code: 'pg', value: 'papua-new-guinea', label: 'Papua New Guinea', continent: 'Oceania' },
		{ code: 'py', value: 'paraguay', label: 'Paraguay', continent: 'South America' },
		{ code: 'pe', value: 'peru', label: 'Peru', continent: 'South America' },
		{ code: 'ph', value: 'philippines', label: 'Philippines', continent: 'Asia' },
		{ code: 'pl', value: 'poland', label: 'Poland', continent: 'Europe' },
		{ code: 'pt', value: 'portugal', label: 'Portugal', continent: 'Europe' },
		{ code: 'qa', value: 'qatar', label: 'Qatar', continent: 'Asia' },
		{ code: 'ro', value: 'romania', label: 'Romania', continent: 'Europe' },
		{ code: 'ru', value: 'russia', label: 'Russia', continent: 'Europe' },
		{ code: 'rw', value: 'rwanda', label: 'Rwanda', continent: 'Africa' },
		{ code: 'ws', value: 'samoa', label: 'Samoa', continent: 'Oceania' },
		{ code: 'sm', value: 'san-marino', label: 'San Marino', continent: 'Europe' },
		{ code: 'sa', value: 'saudi-arabia', label: 'Saudi Arabia', continent: 'Asia' },
		{ code: 'sn', value: 'senegal', label: 'Senegal', continent: 'Africa' },
		{ code: 'rs', value: 'serbia', label: 'Serbia', continent: 'Europe' },
		{ code: 'sc', value: 'seychelles', label: 'Seychelles', continent: 'Africa' },
		{ code: 'sl', value: 'sierra-leone', label: 'Sierra Leone', continent: 'Africa' },
		{ code: 'sg', value: 'singapore', label: 'Singapore', continent: 'Asia' },
		{ code: 'sk', value: 'slovakia', label: 'Slovakia', continent: 'Europe' },
		{ code: 'si', value: 'slovenia', label: 'Slovenia', continent: 'Europe' },
		{ code: 'sb', value: 'solomon-islands', label: 'Solomon Islands', continent: 'Oceania' },
		{ code: 'so', value: 'somalia', label: 'Somalia', continent: 'Africa' },
		{ code: 'za', value: 'south-africa', label: 'South Africa', continent: 'Africa' },
		{ code: 'kr', value: 'south-korea', label: 'South Korea', continent: 'Asia' },
		{ code: 'ss', value: 'south-sudan', label: 'South Sudan', continent: 'Africa' },
		{ code: 'es', value: 'spain', label: 'Spain', continent: 'Europe' },
		{ code: 'lk', value: 'sri-lanka', label: 'Sri Lanka', continent: 'Asia' },
		{ code: 'sd', value: 'sudan', label: 'Sudan', continent: 'Africa' },
		{ code: 'sr', value: 'suriname', label: 'Suriname', continent: 'South America' },
		{ code: 'se', value: 'sweden', label: 'Sweden', continent: 'Europe' },
		{ code: 'ch', value: 'switzerland', label: 'Switzerland', continent: 'Europe' },
		{ code: 'sy', value: 'syria', label: 'Syria', continent: 'Asia' },
		{ code: 'tw', value: 'taiwan', label: 'Taiwan', continent: 'Asia' },
		{ code: 'tj', value: 'tajikistan', label: 'Tajikistan', continent: 'Asia' },
		{ code: 'tz', value: 'tanzania', label: 'Tanzania', continent: 'Africa' },
		{ code: 'th', value: 'thailand', label: 'Thailand', continent: 'Asia' },
		{ code: 'tl', value: 'timor-leste', label: 'Timor-Leste', continent: 'Asia' },
		{ code: 'tg', value: 'togo', label: 'Togo', continent: 'Africa' },
		{ code: 'to', value: 'tonga', label: 'Tonga', continent: 'Oceania' },
		{
			code: 'tt',
			value: 'trinidad-and-tobago',
			label: 'Trinidad and Tobago',
			continent: 'North America'
		},
		{ code: 'tn', value: 'tunisia', label: 'Tunisia', continent: 'Africa' },
		{ code: 'tr', value: 'turkey', label: 'Turkey', continent: 'Asia' },
		{ code: 'tm', value: 'turkmenistan', label: 'Turkmenistan', continent: 'Asia' },
		{ code: 'tv', value: 'tuvalu', label: 'Tuvalu', continent: 'Oceania' },
		{ code: 'ug', value: 'uganda', label: 'Uganda', continent: 'Africa' },
		{ code: 'ua', value: 'ukraine', label: 'Ukraine', continent: 'Europe' },
		{ code: 'ae', value: 'united-arab-emirates', label: 'United Arab Emirates', continent: 'Asia' },
		{ code: 'gb', value: 'united-kingdom', label: 'United Kingdom', continent: 'Europe' },
		{ code: 'us', value: 'united-states', label: 'United States', continent: 'North America' },
		{ code: 'uy', value: 'uruguay', label: 'Uruguay', continent: 'South America' },
		{ code: 'uz', value: 'uzbekistan', label: 'Uzbekistan', continent: 'Asia' },
		{ code: 'vu', value: 'vanuatu', label: 'Vanuatu', continent: 'Oceania' },
		{ code: 'va', value: 'vatican-city', label: 'Vatican City', continent: 'Europe' },
		{ code: 've', value: 'venezuela', label: 'Venezuela', continent: 'South America' },
		{ code: 'vn', value: 'vietnam', label: 'Vietnam', continent: 'Asia' },
		{ code: 'ye', value: 'yemen', label: 'Yemen', continent: 'Asia' },
		{ code: 'zm', value: 'zambia', label: 'Zambia', continent: 'Africa' },
		{ code: 'zw', value: 'zimbabwe', label: 'Zimbabwe', continent: 'Africa' }
	];
</script>

{#snippet CaretUpDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
	</svg>
{/snippet}

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

<div class="flex flex-col items-start gap-1">
	<Combobox.Root items={countries}>
		<Combobox.Label
			class="cursor-default text-sm leading-5 font-bold text-neutral-950 dark:text-white"
		>
			Country
		</Combobox.Label>
		<Combobox.Trigger
			class="flex h-8 min-w-40 cursor-default items-center justify-between gap-3 border border-neutral-950 bg-white pl-2 pr-1 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-pressed:bg-neutral-100 data-placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:data-placeholder:text-neutral-400 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-pressed:bg-neutral-800"
		>
			<Combobox.Value placeholder="Select country" />
			<Combobox.Icon class="text-neutral-950 dark:text-white">
				{@render CaretUpDownIcon()}
			</Combobox.Icon>
		</Combobox.Trigger>
		<Combobox.Portal>
			<Combobox.Positioner align="start" sideOffset={4}>
				<Combobox.Popup
					class="[--input-container-height:2rem] max-h-[24.5rem] max-w-[var(--available-width)] origin-[var(--transform-origin)] bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] duration-150 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0  dark:bg-neutral-950 dark:text-white dark:shadow-none"
					aria-label="Select country"
				>
					<Combobox.Input
						placeholder="e.g. United Kingdom"
						class="h-8 w-full min-w-80 border border-neutral-950 bg-white px-2 text-sm font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 any-pointer-coarse:text-base dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:border-white dark:focus:outline-white"
					/>
					<div class="border-x border-b border-neutral-950 dark:border-white">
						<Combobox.Empty>
							<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
								No countries found.
							</div>
						</Combobox.Empty>
						<Combobox.List
							class="max-h-[min(calc(24.5rem-var(--input-container-height)-2px),calc(var(--available-height)-var(--input-container-height)-2px))] overflow-auto overscroll-contain py-1 scroll-py-1 empty:p-0"
						>
							<Combobox.Collection>
								{#snippet children(country: Country)}
									<Combobox.Item
										value={country}
										class="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
									>
										<Combobox.ItemIndicator class="col-start-1">
											{@render CheckIcon()}
										</Combobox.ItemIndicator>
										<span class="col-start-2">{country.label}</span>
									</Combobox.Item>
								{/snippet}
							</Combobox.Collection>
						</Combobox.List>
					</div>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
</div>
```

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

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const id = $props.id();

	interface Produce {
		id: string;
		label: string;
		group: 'Fruits' | 'Vegetables';
	}

	interface ProduceGroup {
		value: string;
		items: Produce[];
	}

	const produceData: Produce[] = [
		{ id: 'fruit-apple', label: 'Apple', group: 'Fruits' },
		{ id: 'fruit-banana', label: 'Banana', group: 'Fruits' },
		{ id: 'fruit-mango', label: 'Mango', group: 'Fruits' },
		{ id: 'fruit-kiwi', label: 'Kiwi', group: 'Fruits' },
		{ id: 'fruit-grape', label: 'Grape', group: 'Fruits' },
		{ id: 'fruit-orange', label: 'Orange', group: 'Fruits' },
		{ id: 'fruit-strawberry', label: 'Strawberry', group: 'Fruits' },
		{ id: 'fruit-watermelon', label: 'Watermelon', group: 'Fruits' },
		{ id: 'veg-broccoli', label: 'Broccoli', group: 'Vegetables' },
		{ id: 'veg-carrot', label: 'Carrot', group: 'Vegetables' },
		{ id: 'veg-cauliflower', label: 'Cauliflower', group: 'Vegetables' },
		{ id: 'veg-cucumber', label: 'Cucumber', group: 'Vegetables' },
		{ id: 'veg-kale', label: 'Kale', group: 'Vegetables' },
		{ id: 'veg-pepper', label: 'Bell pepper', group: 'Vegetables' },
		{ id: 'veg-spinach', label: 'Spinach', group: 'Vegetables' },
		{ id: 'veg-zucchini', label: 'Zucchini', group: 'Vegetables' }
	];

	function groupProduce(items: Produce[]): ProduceGroup[] {
		const groups: Record<string, Produce[]> = {};
		items.forEach((item) => {
			(groups[item.group] ??= []).push(item);
		});
		const order = ['Fruits', 'Vegetables'];
		return order.map((value) => ({ value, items: groups[value] ?? [] }));
	}

	const groupedProduce: ProduceGroup[] = groupProduce(produceData);
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<Combobox.Root items={groupedProduce}>
	<div
		class="relative flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
	>
		<label for={id}>Select produce</label>
		<Combobox.InputGroup
			class="relative h-8 w-64 border border-neutral-950 bg-white dark:bg-neutral-950 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white [&>input]:pr-[calc(0.5rem+2rem)] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
		>
			<Combobox.Input
				placeholder="e.g. Mango"
				{id}
				class="h-full w-full border-0 bg-white pl-2 dark:bg-neutral-950 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
			/>
			<div
				class="absolute right-0 bottom-0 flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400"
			>
				<Combobox.Clear
					class="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Clear selection"
				>
					{@render XIcon()}
				</Combobox.Clear>
				<Combobox.Trigger
					class="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Open popup"
				>
					{@render CaretDownIcon()}
				</Combobox.Trigger>
			</div>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No produce found.
					</div>
				</Combobox.Empty>
				<Combobox.List
					class="max-h-[min(22.5rem,var(--available-height))] overflow-auto overscroll-contain py-1 scroll-py-1 outline-0"
				>
					<Combobox.Collection>
						{#snippet children(group: ProduceGroup)}
							<Combobox.Group items={group.items} class="block pb-2 last:pb-0">
								<Combobox.GroupLabel
									class="py-2 pr-2 pl-8 text-sm leading-4 text-neutral-500 select-none dark:text-neutral-400"
								>
									{group.value}
								</Combobox.GroupLabel>
								<Combobox.Collection>
									{#snippet children(item: Produce)}
										<Combobox.Item
											value={item}
											class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
										>
											<Combobox.ItemIndicator class="col-start-1 flex items-center justify-center">
												{@render CheckIcon()}
											</Combobox.ItemIndicator>
											<span class="col-start-2">{item.label}</span>
										</Combobox.Item>
									{/snippet}
								</Combobox.Collection>
							</Combobox.Group>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

### Async search (single)

Load items from a remote source by fetching on input changes. Keep the selected item in the `items` list so it remains available while new results stream in. This pattern avoids needing to load items upfront.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const id = $props.id();

	let searchResults = $state.raw<DirectoryUser[]>([]);
	let selectedValue = $state.raw<DirectoryUser | null>(null);
	let searchValue = $state('');
	let error = $state<string | null>(null);
	let isPending = $state(false);

	const { contains } = Combobox.useFilter();

	let abortController: AbortController | null = null;

	const trimmedSearchValue = $derived(searchValue.trim());

	const items = $derived.by(() => {
		if (!selectedValue || searchResults.some((user) => user.id === selectedValue!.id)) {
			return searchResults;
		}

		return [...searchResults, selectedValue];
	});

	const status = $derived.by(() => {
		if (isPending) {
			return 'Searching…';
		}

		if (error) {
			return error;
		}

		if (trimmedSearchValue === '') {
			return selectedValue ? null : 'Start typing to search people…';
		}

		if (searchResults.length === 0) {
			return `No matches for "${trimmedSearchValue}".`;
		}

		return null;
	});

	const emptyMessage = $derived.by(() => {
		if (trimmedSearchValue === '' || isPending || searchResults.length > 0 || error) {
			return null;
		}
		return 'Try a different search term.';
	});

	async function search(query: string) {
		const controller = new AbortController();
		abortController?.abort();
		abortController = controller;

		isPending = true;
		error = null;

		const result = await searchUsers(query, contains);

		if (controller.signal.aborted) {
			return;
		}

		isPending = false;
		searchResults = result.users;
		error = result.error;
	}

	interface DirectoryUser {
		id: string;
		name: string;
		username: string;
		email: string;
		title: string;
	}

	async function searchUsers(
		query: string,
		filter: (item: string, query: string) => boolean
	): Promise<{ users: DirectoryUser[]; error: string | null }> {
		// Simulate network delay
		await new Promise((resolve) => {
			setTimeout(resolve, Math.random() * 500 + 100);
		});

		// Simulate occasional network errors (1% chance)
		if (Math.random() < 0.01 || query === 'will_error') {
			return {
				users: [],
				error: 'Failed to fetch people. Please try again.'
			};
		}

		const users = allUsers.filter((user) => {
			return (
				filter(user.name, query) ||
				filter(user.username, query) ||
				filter(user.email, query) ||
				filter(user.title, query)
			);
		});

		return {
			users,
			error: null
		};
	}

	const allUsers: DirectoryUser[] = [
		{
			id: 'leslie-alexander',
			name: 'Leslie Alexander',
			username: 'leslie',
			email: 'leslie.alexander@example.com',
			title: 'Product Manager'
		},
		{
			id: 'kathryn-murphy',
			name: 'Kathryn Murphy',
			username: 'kathryn',
			email: 'kathryn.murphy@example.com',
			title: 'Marketing Lead'
		},
		{
			id: 'courtney-henry',
			name: 'Courtney Henry',
			username: 'courtney',
			email: 'courtney.henry@example.com',
			title: 'Design Systems'
		},
		{
			id: 'michael-foster',
			name: 'Michael Foster',
			username: 'michael',
			email: 'michael.foster@example.com',
			title: 'Engineering Manager'
		},
		{
			id: 'lindsay-walton',
			name: 'Lindsay Walton',
			username: 'lindsay',
			email: 'lindsay.walton@example.com',
			title: 'Product Designer'
		},
		{
			id: 'tom-cook',
			name: 'Tom Cook',
			username: 'tom',
			email: 'tom.cook@example.com',
			title: 'Frontend Engineer'
		},
		{
			id: 'whitney-francis',
			name: 'Whitney Francis',
			username: 'whitney',
			email: 'whitney.francis@example.com',
			title: 'Customer Success'
		},
		{
			id: 'jacob-jones',
			name: 'Jacob Jones',
			username: 'jacob',
			email: 'jacob.jones@example.com',
			title: 'Security Engineer'
		},
		{
			id: 'arlene-mccoy',
			name: 'Arlene McCoy',
			username: 'arlene',
			email: 'arlene.mccoy@example.com',
			title: 'Data Analyst'
		},
		{
			id: 'marvin-mckinney',
			name: 'Marvin McKinney',
			username: 'marvin',
			email: 'marvin.mckinney@example.com',
			title: 'QA Specialist'
		},
		{
			id: 'eleanor-pena',
			name: 'Eleanor Pena',
			username: 'eleanor',
			email: 'eleanor.pena@example.com',
			title: 'Operations'
		},
		{
			id: 'jerome-bell',
			name: 'Jerome Bell',
			username: 'jerome',
			email: 'jerome.bell@example.com',
			title: 'DevOps Engineer'
		}
	];
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

{#snippet CaretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<Combobox.Root
	{items}
	itemToStringLabel={(user: DirectoryUser) => user.name}
	isItemEqualToValue={(item, value) => item.id === value.id}
	filter={null}
	onOpenChangeComplete={(open) => {
		if (!open && selectedValue) {
			searchResults = [selectedValue];
		}
	}}
	onValueChange={(nextSelectedValue) => {
		selectedValue = nextSelectedValue;
		searchValue = '';
		error = null;
	}}
	onInputValueChange={(nextSearchValue, { reason }) => {
		searchValue = nextSearchValue;

		if (nextSearchValue === '') {
			abortController?.abort();
			isPending = false;
			searchResults = [];
			error = null;
			return;
		}

		if (reason === 'item-press') {
			return;
		}

		search(nextSearchValue);
	}}
>
	<div
		class="relative flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
	>
		<label for={id}>Assign reviewer</label>
		<Combobox.InputGroup
			class="relative h-8 w-64 border border-neutral-950 bg-white dark:bg-neutral-950 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white md:w-80 [&>input]:pr-[calc(0.5rem+2rem)] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
		>
			<Combobox.Input
				{id}
				placeholder="e.g. Michael"
				class="h-full w-full border-0 bg-white pl-2 dark:bg-neutral-950 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
			/>
			<div
				class="absolute right-0 bottom-0 flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400"
			>
				<Combobox.Clear
					class="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Clear selection"
				>
					{@render XIcon()}
				</Combobox.Clear>
				<Combobox.Trigger
					class="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white"
					aria-label="Open popup"
				>
					{@render CaretDownIcon()}
				</Combobox.Trigger>
			</div>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				aria-busy={isPending ? true : undefined}
			>
				<div
					class="max-h-[min(var(--available-height),22.5rem)] overflow-y-auto overscroll-contain py-1 scroll-pt-1 scroll-pb-1"
				>
					<Combobox.Status>
						{#if status}
							<div
								class="flex items-center gap-2 py-1 pr-5 pl-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400"
							>
								{#if isPending}
									<span
										aria-hidden="true"
										class="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent"
									></span>
								{/if}
								{status}
							</div>
						{/if}
					</Combobox.Status>
					<Combobox.Empty>
						{#if emptyMessage}
							<div class="py-2 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
								{emptyMessage}
							</div>
						{/if}
					</Combobox.Empty>
					<Combobox.List>
						<Combobox.Collection>
							{#snippet children(user: DirectoryUser)}
								<Combobox.Item
									value={user}
									class="grid cursor-default grid-cols-[1rem_1fr] items-start gap-2 px-2 py-2 text-sm leading-[1.2rem] outline-none select-none [@media(hover:hover)]:data-highlighted:relative [@media(hover:hover)]:data-highlighted:z-0 [@media(hover:hover)]:data-highlighted:text-neutral-950 [@media(hover:hover)]:data-highlighted:before:absolute [@media(hover:hover)]:data-highlighted:before:inset-0 [@media(hover:hover)]:data-highlighted:before:z-[-1] [@media(hover:hover)]:data-highlighted:before:bg-neutral-100 dark:[@media(hover:hover)]:data-highlighted:text-white dark:[@media(hover:hover)]:data-highlighted:before:bg-neutral-800"
								>
									<Combobox.ItemIndicator class="col-start-1 mt-1">
										{@render CheckIcon()}
									</Combobox.ItemIndicator>
									<span class="col-start-2 flex flex-col gap-1">
										<span class="text-sm leading-5 font-bold">{user.name}</span>
										<span class="text-xs">{user.email}</span>
										<span
											class="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400"
										>
											<span>@{user.username}</span>
											<span>{user.title}</span>
										</span>
									</span>
								</Combobox.Item>
							{/snippet}
						</Combobox.Collection>
					</Combobox.List>
				</div>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

### Async search (multiple)

Load items from a remote source by fetching on input changes while supporting multiple selections. Selected items remain available in the list while new matches stream in. This pattern avoids needing to load items upfront.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	const id = $props.id();

	const chipProps = { 'aria-description': 'Press Backspace or Delete to remove' };

	function inputProps(selectedCount: number) {
		return {
			'aria-description':
				selectedCount > 0
					? `${selectedCount} selected. From the start of the input, press Left Arrow to focus the selected items`
					: undefined
		};
	}

	let searchResults = $state.raw<DirectoryUser[]>([]);
	let selectedValues = $state.raw<DirectoryUser[]>([]);
	let searchValue = $state('');
	let error = $state<string | null>(null);
	let blockStartStatus = $state(false);
	let isPending = $state(false);

	const { contains } = Combobox.useFilter();

	let abortController: AbortController | null = null;

	const trimmedSearchValue = $derived(searchValue.trim());

	const items = $derived.by(() => {
		if (selectedValues.length === 0) {
			return searchResults;
		}

		const merged = [...searchResults];

		selectedValues.forEach((user) => {
			if (!searchResults.some((result) => result.id === user.id)) {
				merged.push(user);
			}
		});

		return merged;
	});

	const status = $derived.by(() => {
		if (isPending) {
			return 'Searching…';
		}

		if (error) {
			return error;
		}

		if (trimmedSearchValue === '' && !blockStartStatus) {
			return selectedValues.length > 0 ? null : 'Start typing to search people…';
		}

		if (searchResults.length === 0 && !blockStartStatus) {
			return `No matches for "${trimmedSearchValue}".`;
		}

		return null;
	});

	const emptyMessage = $derived.by(() => {
		if (trimmedSearchValue === '' || isPending || searchResults.length > 0 || error) {
			return null;
		}

		return 'Try a different search term.';
	});

	async function search(query: string) {
		const controller = new AbortController();
		abortController?.abort();
		abortController = controller;

		isPending = true;
		error = null;

		const result = await searchUsers(query, contains);

		if (controller.signal.aborted) {
			return;
		}

		isPending = false;
		searchResults = result.users;
		error = result.error;
	}

	interface DirectoryUser {
		id: string;
		name: string;
		username: string;
		email: string;
		title: string;
	}

	async function searchUsers(
		query: string,
		filter: (item: string, query: string) => boolean
	): Promise<{ users: DirectoryUser[]; error: string | null }> {
		// Simulate network delay
		await new Promise((resolve) => {
			setTimeout(resolve, Math.random() * 500 + 100);
		});

		// Simulate occasional network errors (1% chance)
		if (Math.random() < 0.01 || query === 'will_error') {
			return {
				users: [],
				error: 'Failed to fetch people. Please try again.'
			};
		}

		const users = allUsers.filter((user) => {
			return (
				filter(user.name, query) ||
				filter(user.username, query) ||
				filter(user.email, query) ||
				filter(user.title, query)
			);
		});

		return {
			users,
			error: null
		};
	}

	const allUsers: DirectoryUser[] = [
		{
			id: 'leslie-alexander',
			name: 'Leslie Alexander',
			username: 'leslie',
			email: 'leslie.alexander@example.com',
			title: 'Product Manager'
		},
		{
			id: 'kathryn-murphy',
			name: 'Kathryn Murphy',
			username: 'kathryn',
			email: 'kathryn.murphy@example.com',
			title: 'Marketing Lead'
		},
		{
			id: 'courtney-henry',
			name: 'Courtney Henry',
			username: 'courtney',
			email: 'courtney.henry@example.com',
			title: 'Design Systems'
		},
		{
			id: 'michael-foster',
			name: 'Michael Foster',
			username: 'michael',
			email: 'michael.foster@example.com',
			title: 'Engineering Manager'
		},
		{
			id: 'lindsay-walton',
			name: 'Lindsay Walton',
			username: 'lindsay',
			email: 'lindsay.walton@example.com',
			title: 'Product Designer'
		},
		{
			id: 'tom-cook',
			name: 'Tom Cook',
			username: 'tom',
			email: 'tom.cook@example.com',
			title: 'Frontend Engineer'
		},
		{
			id: 'whitney-francis',
			name: 'Whitney Francis',
			username: 'whitney',
			email: 'whitney.francis@example.com',
			title: 'Customer Success'
		},
		{
			id: 'jacob-jones',
			name: 'Jacob Jones',
			username: 'jacob',
			email: 'jacob.jones@example.com',
			title: 'Security Engineer'
		},
		{
			id: 'arlene-mccoy',
			name: 'Arlene McCoy',
			username: 'arlene',
			email: 'arlene.mccoy@example.com',
			title: 'Data Analyst'
		},
		{
			id: 'marvin-mckinney',
			name: 'Marvin McKinney',
			username: 'marvin',
			email: 'marvin.mckinney@example.com',
			title: 'QA Specialist'
		},
		{
			id: 'eleanor-pena',
			name: 'Eleanor Pena',
			username: 'eleanor',
			email: 'eleanor.pena@example.com',
			title: 'Operations'
		},
		{
			id: 'jerome-bell',
			name: 'Jerome Bell',
			username: 'jerome',
			email: 'jerome.bell@example.com',
			title: 'DevOps Engineer'
		}
	];
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

<Combobox.Root
	{items}
	itemToStringLabel={(user: DirectoryUser) => user.name}
	isItemEqualToValue={(item, value) => item.id === value.id}
	multiple
	filter={null}
	onOpenChangeComplete={(open) => {
		if (!open) {
			searchResults = selectedValues;
			blockStartStatus = false;
		}
	}}
	onValueChange={(nextSelectedValues) => {
		selectedValues = nextSelectedValues;
		searchValue = '';
		error = null;

		if (nextSelectedValues.length === 0) {
			searchResults = [];
			blockStartStatus = false;
		} else {
			blockStartStatus = true;
		}
	}}
	onInputValueChange={(nextSearchValue, { reason }) => {
		searchValue = nextSearchValue;

		abortController?.abort();

		if (nextSearchValue === '') {
			isPending = false;
			searchResults = selectedValues;
			error = null;
			blockStartStatus = false;
			return;
		}

		if (reason === 'item-press') {
			return;
		}

		search(nextSearchValue);
	}}
>
	<div class="max-w-md flex flex-col gap-1">
		<label
			class="flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
			for={id}
		>
			Assign reviewers
		</label>
		<Combobox.InputGroup
			class="flex min-h-8 w-64 cursor-text flex-wrap items-center gap-0.5 border border-neutral-950 bg-white dark:bg-neutral-950 px-2 py-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white has-[button]:px-1 dark:border-white min-[32rem]:w-[22rem]"
		>
			<Combobox.Value>
				{#snippet children(selected)}
					{@const value = selected as DirectoryUser[]}
					<Combobox.Chips
						class="flex w-full flex-wrap items-center gap-1"
						aria-label={value.length > 0 ? 'Selected reviewers' : undefined}
					>
						{#each value as user (user.id)}
							<Combobox.Chip
								class="group flex min-h-[calc(1.5rem-2px)] cursor-default items-center gap-1 overflow-hidden bg-neutral-100 py-0 pr-[0.2rem] pl-[0.4rem] text-sm leading-none text-neutral-950 outline-none focus-within:bg-neutral-950 focus-within:text-white [@media(hover:hover)]:data-highlighted:bg-neutral-950 [@media(hover:hover)]:data-highlighted:text-white dark:bg-neutral-800 dark:text-white dark:focus-within:bg-white dark:focus-within:text-neutral-950 dark:[@media(hover:hover)]:data-highlighted:bg-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950"
								aria-label={user.name}
								{...chipProps}
							>
								{user.name}
								<Combobox.ChipRemove
									class="flex size-4 items-center justify-center border-0 bg-transparent p-0 text-inherit hover:bg-neutral-200 group-focus-within:hover:bg-neutral-700 dark:hover:bg-neutral-700 dark:group-focus-within:hover:bg-neutral-200"
									aria-label="Remove {user.name}"
								>
									{@render XIcon()}
								</Combobox.ChipRemove>
							</Combobox.Chip>
						{/each}
						<Combobox.Input
							{id}
							placeholder={value.length > 0 ? '' : 'e.g. Michael'}
							{...inputProps(value.length)}
							class="h-[calc(1.5rem-2px)] min-w-12 flex-1 border-0 bg-white p-0 text-sm any-pointer-coarse:text-base dark:bg-neutral-950 font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
						/>
					</Combobox.Chips>
				{/snippet}
			</Combobox.Value>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				aria-busy={isPending ? true : undefined}
			>
				<div
					class="max-h-[min(var(--available-height),24.5rem)] overflow-y-auto overscroll-contain py-1 scroll-pt-1 scroll-pb-1"
				>
					<Combobox.Status>
						{#if status}
							<div
								class="flex items-center gap-2 py-1 pr-5 pl-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400"
							>
								{#if isPending}
									<span
										aria-hidden="true"
										class="inline-block size-3 animate-[spin_0.75s_linear_infinite] rounded-full border border-current border-r-transparent"
									></span>
								{/if}
								{status}
							</div>
						{/if}
					</Combobox.Status>
					<Combobox.Empty>
						{#if emptyMessage}
							<div class="py-2 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
								{emptyMessage}
							</div>
						{/if}
					</Combobox.Empty>
					<Combobox.List>
						<Combobox.Collection>
							{#snippet children(user: DirectoryUser)}
								<Combobox.Item
									value={user}
									class="grid cursor-default grid-cols-[1rem_1fr] items-start gap-2 px-2 py-2 text-sm leading-[1.2rem] outline-none select-none [@media(hover:hover)]:data-highlighted:relative [@media(hover:hover)]:data-highlighted:z-0 [@media(hover:hover)]:data-highlighted:text-neutral-950 [@media(hover:hover)]:data-highlighted:before:absolute [@media(hover:hover)]:data-highlighted:before:inset-0 [@media(hover:hover)]:data-highlighted:before:z-[-1] [@media(hover:hover)]:data-highlighted:before:bg-neutral-100 dark:[@media(hover:hover)]:data-highlighted:text-white dark:[@media(hover:hover)]:data-highlighted:before:bg-neutral-800"
								>
									<Combobox.ItemIndicator class="col-start-1 mt-1">
										{@render CheckIcon()}
									</Combobox.ItemIndicator>
									<span class="col-start-2 flex flex-col gap-1">
										<span class="text-sm leading-5 font-bold">{user.name}</span>
										<span class="text-xs">{user.email}</span>
										<span
											class="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400"
										>
											<span>@{user.username}</span>
											<span>{user.title}</span>
										</span>
									</span>
								</Combobox.Item>
							{/snippet}
						</Combobox.Collection>
					</Combobox.List>
				</div>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

### Creatable

Create a new item when the filter matches no items, opening a creation `<Dialog>`.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import { Dialog } from '@sveltery/base/dialog';

	const id = $props.id();

	const chipProps = { 'aria-description': 'Press Backspace or Delete to remove' };

	function inputProps(selectedCount: number) {
		return {
			'aria-description':
				selectedCount > 0
					? `${selectedCount} selected. From the start of the input, press Left Arrow to focus the selected items`
					: undefined
		};
	}

	interface LabelItem {
		creatable?: string;
		id: string;
		value: string;
	}

	const initialLabels: LabelItem[] = [
		{ id: 'bug', value: 'bug' },
		{ id: 'docs', value: 'documentation' },
		{ id: 'enhancement', value: 'enhancement' },
		{ id: 'help-wanted', value: 'help wanted' },
		{ id: 'good-first-issue', value: 'good first issue' }
	];

	let labels = $state.raw<LabelItem[]>(initialLabels);
	let selected = $state.raw<LabelItem[]>([]);
	let query = $state('');
	let openDialog = $state(false);
	let pendingQuery = $state('');

	let createInput = $state<HTMLInputElement>();
	let highlightedItem: LabelItem | undefined;

	function handleInputKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || highlightedItem) {
			return;
		}

		const currentTrimmed = query.trim();
		if (currentTrimmed === '') {
			return;
		}

		const normalized = currentTrimmed.toLocaleLowerCase();
		const existing = labels.find((label) => label.value.trim().toLocaleLowerCase() === normalized);

		if (existing) {
			selected = selected.some((item) => item.id === existing.id)
				? selected
				: [...selected, existing];
			query = '';
			return;
		}

		pendingQuery = currentTrimmed;
		openDialog = true;
	}

	function handleCreate() {
		const value = createInput ? createInput.value.trim() : '';
		if (!value) {
			return;
		}

		const normalized = value.toLocaleLowerCase();
		const baseId = normalized.replace(/\s+/g, '-');
		const existing = labels.find((l) => l.value.trim().toLocaleLowerCase() === normalized);

		if (existing) {
			selected = selected.some((i) => i.id === existing.id) ? selected : [...selected, existing];
			openDialog = false;
			query = '';
			return;
		}

		// Ensure we don't collide with an existing id (e.g., value "docs" vs. existing id "docs")
		const existingIds = new Set(labels.map((l) => l.id));
		let uniqueId = baseId;
		if (existingIds.has(uniqueId)) {
			let i = 2;
			while (existingIds.has(`${baseId}-${i}`)) {
				i += 1;
			}
			uniqueId = `${baseId}-${i}`;
		}

		const newItem: LabelItem = { id: uniqueId, value };

		if (!selected.find((item) => item.id === newItem.id)) {
			labels = [...labels, newItem];
			selected = [...selected, newItem];
		}

		openDialog = false;
		query = '';
	}

	const trimmed = $derived(query.trim());
	const lowered = $derived(trimmed.toLocaleLowerCase());
	const exactExists = $derived(labels.some((l) => l.value.trim().toLocaleLowerCase() === lowered));
	// Show the creatable item alongside matches if there's no exact match
	const itemsForView: LabelItem[] = $derived(
		trimmed !== '' && !exactExists
			? [...labels, { creatable: trimmed, id: `create:${lowered}`, value: `Create "${trimmed}"` }]
			: labels
	);
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet PlusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}

{#snippet XIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m4.5 4.5 7 7m-7 0 7-7" />
	</svg>
{/snippet}

<Combobox.Root
	items={itemsForView}
	multiple
	bind:value={selected}
	bind:inputValue={query}
	onValueChange={(next, eventDetails) => {
		const creatableSelection = next.find(
			(item) => item.creatable && !selected.some((current) => current.id === item.id)
		);

		if (creatableSelection && creatableSelection.creatable) {
			pendingQuery = creatableSelection.creatable;
			openDialog = true;
			eventDetails.cancel();
			return;
		}
		query = '';
	}}
	onItemHighlighted={(item) => {
		highlightedItem = item;
	}}
>
	<div class="max-w-md flex flex-col gap-1">
		<label
			class="flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white"
			for={id}
		>
			Labels
		</label>
		<Combobox.InputGroup
			class="flex min-h-8 w-64 cursor-text flex-wrap items-center gap-0.5 border border-neutral-950 bg-white dark:bg-neutral-950 px-2 py-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white has-[button]:px-1 dark:border-white min-[32rem]:w-[22rem]"
		>
			<Combobox.Value>
				{#snippet children(selectedValue)}
					{@const value = selectedValue as LabelItem[]}
					<Combobox.Chips
						class="flex w-full flex-wrap items-center gap-1"
						aria-label={value.length > 0 ? 'Selected labels' : undefined}
					>
						{#each value as label (label.id)}
							<Combobox.Chip
								class="group flex min-h-[calc(1.5rem-2px)] cursor-default items-center gap-1 overflow-hidden bg-neutral-100 py-0 pr-[0.2rem] pl-[0.4rem] text-sm leading-none text-neutral-950 outline-none focus-within:bg-neutral-950 focus-within:text-white [@media(hover:hover)]:data-highlighted:bg-neutral-950 [@media(hover:hover)]:data-highlighted:text-white dark:bg-neutral-800 dark:text-white dark:focus-within:bg-white dark:focus-within:text-neutral-950 dark:[@media(hover:hover)]:data-highlighted:bg-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950"
								aria-label={label.value}
								{...chipProps}
							>
								{label.value}
								<Combobox.ChipRemove
									class="flex size-4 items-center justify-center border-0 bg-transparent p-0 text-inherit hover:bg-neutral-200 group-focus-within:hover:bg-neutral-700 dark:hover:bg-neutral-700 dark:group-focus-within:hover:bg-neutral-200"
									aria-label="Remove {label.value}"
								>
									{@render XIcon()}
								</Combobox.ChipRemove>
							</Combobox.Chip>
						{/each}
						<Combobox.Input
							{id}
							placeholder={value.length > 0 ? '' : 'e.g. bug'}
							{...inputProps(value.length)}
							class="h-[calc(1.5rem-2px)] min-w-12 flex-1 border-0 bg-white p-0 text-sm any-pointer-coarse:text-base dark:bg-neutral-950 font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white"
							onkeydown={handleInputKeyDown}
						/>
					</Combobox.Chips>
				{/snippet}
			</Combobox.Value>
		</Combobox.InputGroup>
	</div>

	<Combobox.Portal>
		<Combobox.Positioner class="z-50 outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-h-[min(var(--available-height),24.5rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto overscroll-contain border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-2 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No labels found.
					</div>
				</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(item: LabelItem)}
							{#if item.creatable}
								<Combobox.Item
									value={item}
									class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-selected:relative data-selected:z-0 data-selected:text-neutral-950 data-selected:before:absolute data-selected:before:inset-0 data-selected:before:z-[-1] [@media(hover:hover)]:data-highlighted:relative [@media(hover:hover)]:data-highlighted:z-0 [@media(hover:hover)]:data-highlighted:text-white [@media(hover:hover)]:data-highlighted:before:absolute [@media(hover:hover)]:data-highlighted:before:inset-0 [@media(hover:hover)]:data-highlighted:before:z-[-1] [@media(hover:hover)]:data-highlighted:before:bg-neutral-950 dark:data-selected:text-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950 dark:[@media(hover:hover)]:data-highlighted:before:bg-white"
								>
									<span class="col-start-1">
										{@render PlusIcon()}
									</span>
									<span class="col-start-2">Create "{item.creatable}"</span>
								</Combobox.Item>
							{:else}
								<Combobox.Item
									value={item}
									class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-selected:relative data-selected:z-0 data-selected:text-neutral-950 data-selected:before:absolute data-selected:before:inset-0 data-selected:before:z-[-1] [@media(hover:hover)]:data-highlighted:relative [@media(hover:hover)]:data-highlighted:z-0 [@media(hover:hover)]:data-highlighted:text-white [@media(hover:hover)]:data-highlighted:before:absolute [@media(hover:hover)]:data-highlighted:before:inset-0 [@media(hover:hover)]:data-highlighted:before:z-[-1] [@media(hover:hover)]:data-highlighted:before:bg-neutral-950 dark:data-selected:text-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950 dark:[@media(hover:hover)]:data-highlighted:before:bg-white"
								>
									<Combobox.ItemIndicator class="col-start-1">
										{@render CheckIcon()}
									</Combobox.ItemIndicator>
									<span class="col-start-2">{item.value}</span>
								</Combobox.Item>
							{/if}
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>

<Dialog.Root bind:open={openDialog}>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity dark:opacity-70 data-starting-style:opacity-0 data-ending-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 mt-[-2rem] w-[24rem] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 border border-neutral-950 bg-white p-6 text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-all data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			initialFocus={() => createInput}
		>
			<Dialog.Title class="text-sm leading-5 font-bold">Create new label</Dialog.Title>
			<Dialog.Description class="mb-4 text-sm leading-5 text-neutral-600 dark:text-neutral-400">
				Add a new label to select.
			</Dialog.Description>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					handleCreate();
				}}
			>
				<input
					bind:this={createInput}
					class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:text-white"
					placeholder="Label name"
					value={pendingQuery}
				/>
				<div class="mt-4 flex justify-end gap-3">
					<Dialog.Close
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
						>Cancel</Dialog.Close
					>
					<button
						type="submit"
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
						>Create</button
					>
				</div>
			</form>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/svelte-virtual`. The demo below renders the visible window itself, so it needs no dependency.

```svelte demo
<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';

	interface VirtualizedItem {
		id: string;
		name: string;
	}

	const ROW_SIZE = 32;
	const PADDING = 4;
	const OVERSCAN = 20;

	const virtualizedItems: VirtualizedItem[] = Array.from({ length: 10000 }, (_, index) => {
		const id = String(index + 1);
		const indexLabel = id.padStart(4, '0');
		return { id, name: `Item ${indexLabel}` };
	});

	function getItemLabel(item: VirtualizedItem | null) {
		return item ? item.name : '';
	}

	let scrollElement = $state<HTMLDivElement>();
	let scrollTop = $state(0);
	let viewportHeight = $state(0);
	let count = $state(0);

	function scrollToIndex(index: number, align: 'start' | 'end') {
		if (!scrollElement) {
			return;
		}

		const start = PADDING + index * ROW_SIZE;
		scrollElement.scrollTop =
			align === 'start' ? start - PADDING : start + ROW_SIZE - scrollElement.clientHeight + PADDING;
	}
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

<Combobox.Root
	virtualized
	items={virtualizedItems}
	itemToStringLabel={getItemLabel}
	onItemHighlighted={(item, { reason, index }) => {
		if (!item) {
			return;
		}

		const isStart = index === 0;
		const isEnd = index === count - 1;
		const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd));

		if (shouldScroll) {
			queueMicrotask(() => {
				scrollToIndex(index, isEnd ? 'start' : 'end');
			});
		}
	}}
>
	<label class="flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white">
		Search 10,000 items
		<Combobox.Input
			class="h-8 w-64 border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-3 px-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No items found.
					</div>
				</Combobox.Empty>
				<Combobox.List class="p-0">
					{@const filteredItems = Combobox.useFilteredItems<VirtualizedItem>().current}
					{@const totalSize = filteredItems.length * ROW_SIZE + PADDING * 2}
					{@const first = Math.max(0, Math.floor((scrollTop - PADDING) / ROW_SIZE) - OVERSCAN)}
					{@const last = Math.min(
						filteredItems.length,
						Math.ceil((scrollTop + viewportHeight - PADDING) / ROW_SIZE) + OVERSCAN
					)}
					{#if filteredItems.length}
						<div
							role="presentation"
							bind:this={scrollElement}
							bind:clientHeight={viewportHeight}
							onscroll={(event) => (scrollTop = event.currentTarget.scrollTop)}
							{@attach () => {
								count = filteredItems.length;
							}}
							class="h-[min(22.5rem,var(--total-size))] max-h-[var(--available-height)] overflow-auto overscroll-contain scroll-py-1"
							style="--total-size: {totalSize}px"
						>
							<div role="presentation" class="relative w-full" style="height: {totalSize}px">
								{#each { length: last - first } as _, offset (first + offset)}
									{@const index = first + offset}
									<Combobox.Item
										{index}
										data-index={index}
										value={filteredItems[index]}
										class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
										aria-setsize={filteredItems.length}
										aria-posinset={index + 1}
										style="position: absolute; top: 0; left: 0; width: 100%; height: {ROW_SIZE}px; transform: translateY({PADDING +
											index * ROW_SIZE}px)"
									>
										<Combobox.ItemIndicator class="col-start-1">
											{@render CheckIcon()}
										</Combobox.ItemIndicator>
										<span class="col-start-2">{filteredItems[index].name}</span>
									</Combobox.Item>
								{/each}
							</div>
						</div>
					{/if}
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
```

#### Memoizing items

Svelte updates only what changed, so items need no memoizing: `<Combobox.Collection>` keys each item by its value and reuses the components of unchanged items while the filter changes. This is enough for datasets up to roughly 1,000 items. While it speeds up typing, it does not speed up opening; with a large enough number of items, the mount cost dominates, and virtualization becomes necessary to keep the open interaction fast on low-end devices.

## API reference

### Root

<ApiPart name="combobox" part="Root" />

### Label

<ApiPart name="combobox" part="Label" />

### Value

<ApiPart name="combobox" part="Value" />

### Icon

<ApiPart name="combobox" part="Icon" />

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

### Clear

<ApiPart name="combobox" part="Clear" />

| Attribute             | Description                               |
| --------------------- | ----------------------------------------- |
| `data-popup-open`     | Present when the popup is open.           |
| `data-disabled`       | Present when the button is disabled.      |
| `data-visible`        | Present when there is something to clear. |
| `data-starting-style` | Present when the button is animating in.  |
| `data-ending-style`   | Present when the button is animating out. |

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

### List

<ApiPart name="combobox" part="List" />

| Attribute    | Description                                  |
| ------------ | -------------------------------------------- |
| `data-empty` | Present when the filtered list has no items. |

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

| Attribute          | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator: `horizontal` or `vertical`. |

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This function is used when externally filtering items.
Pass the result to the `filter` prop of `<Combobox.Root>`.

`Combobox.useFilter(options?)` is a plain function, so call it in a `$derived` when its options change. It returns `contains`, `startsWith` and `endsWith` functions with the signature `(item, query, itemToString?) => boolean`. `options` takes `Intl.CollatorOptions` plus `locale`, `multiple` and `value`. In single mode, `contains` matches every item while the query equals the selected `value`'s label.

```svelte
<script lang="ts">
	const { contains } = Combobox.useFilter({ locale: 'de' });
</script>

<Combobox.Root items={countries} filter={contains} />
```

## useFilteredItems

Returns the internally filtered items when called inside `<Combobox.Root>`.

`Combobox.useFilteredItems<Item>()` returns `{ current }`, a read-only array of the filtered items that updates as the query changes. Call it while a component inside the root initializes.

## createItems

Normalizes items into a collection for the `items` prop of `<Combobox.Root>`, deriving each item's selection value and label before rendering.

`Combobox.createItems(data, { getValue, getLabel })` accepts a flat array or an array of groups, and `undefined` while the data is loading. `getValue` returns the item's unique primitive selection value and `getLabel` returns its label. Items cannot have an `items` array, which marks a group.
