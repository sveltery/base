# Select

<Subtitle>
  A common form component for choosing a predefined value in a dropdown menu.
</Subtitle>

<Meta name="description" content="A common form component for choosing a predefined value in a dropdown menu." />

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';

	const apples = [
		{ label: 'Gala', value: 'gala' },
		{ label: 'Fuji', value: 'fuji' },
		{ label: 'Honeycrisp', value: 'honeycrisp' },
		{ label: 'Granny Smith', value: 'granny-smith' },
		{ label: 'Pink Lady', value: 'pink-lady' }
	];
</script>

<div class="flex flex-col items-start gap-1">
	<Select.Root items={apples}>
		<Select.Label class="cursor-default text-sm font-bold text-neutral-950 dark:text-white">
			Apple
		</Select.Label>
		<Select.Trigger
			class="flex h-8 min-w-40 items-center justify-between gap-3 pl-2 pr-1 text-sm leading-none whitespace-nowrap border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 font-normal focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Select.Value
				class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
				placeholder="Select apple"
			/>
			<Select.Icon>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block"
					><path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" /></svg
				>
			</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class="outline-hidden select-none z-10" sideOffset={4}>
				<Select.Popup
					class="group min-w-[var(--anchor-width)] origin-[var(--transform-origin)] bg-clip-padding border border-neutral-950 bg-white text-neutral-950 outline-hidden shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:translate-y-px data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<Select.ScrollUpArrow
						class="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute data-[side=none]:before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] dark:bg-neutral-950"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"><path d="M12 10H4l4-4.5z" /></svg
						>
					</Select.ScrollUpArrow>
					<Select.List
						class="relative py-1 scroll-py-6 overflow-y-auto max-h-[var(--available-height)]"
					>
						{#each apples as { label, value } (label)}
							<Select.Item
								{value}
								class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
							>
								<Select.ItemIndicator class="col-start-1">
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										style="display: block"><path d="m2.5 8.5 4 4 7-9" /></svg
									>
								</Select.ItemIndicator>
								<Select.ItemText class="col-start-2">{label}</Select.ItemText>
							</Select.Item>
						{/each}
					</Select.List>
					<Select.ScrollDownArrow
						class="bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:bottom-[-100%] dark:bg-neutral-950"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"><path d="M12 6H4l4 4.5z" /></svg
						>
					</Select.ScrollDownArrow>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</div>
```

## Usage guidelines

- **Prefer Combobox for large lists**: Select is not filterable, aside from basic keyboard typeahead functionality to find items by focusing and highlighting them. Prefer [Combobox](/components/combobox) instead of Select when the number of items is sufficiently large to warrant filtering.
- **Special positioning behavior**: The select popup by default overlaps its trigger so the selected item's text is aligned with the trigger's value text. This behavior [can be disabled or customized](/components/select#positioning).
- **Form controls must have an accessible name**: Prefer `<Select.Label>`, or provide an `aria-label` on `<Select.Trigger>` when no visible label is rendered. See [Labeling a select](#labeling-a-select) and the [forms guide](/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [JavaScript animations](/handbook/animation#javascript-animations) for animating it with Svelte transitions and for manual control.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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
			<Select.Popup>
				<Select.ScrollUpArrow />
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
				<Select.ScrollDownArrow />
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
```

## Positioning

`<Select.Positioner>` has a special prop called `alignItemWithTrigger` which causes the positioning to act differently by default from other `Positioner` components.
The prop makes the select popup overlap the trigger so the selected item's text is aligned with the trigger's value text.

For styling, `data-side` is `"none"` on the `.Popup` and `.Positioner` parts when the mode is active.

To prevent the select popup from overlapping its trigger, set the `alignItemWithTrigger` prop to `false`.
When set to `true` (its default) there are a few important points to note about its behavior:

- **Interaction type dependent**: For UX reasons, the `alignItemWithTrigger` positioning mode is disabled if touch was the pointer type used to open the popup.
- **Viewport space dependent**: There must be enough space in the viewport to align the selected item's text with the trigger's value text without causing the popup to be too vertically small - otherwise, it falls back to the default positioning mode.
  This can be customized by setting `min-height` on the `<Select.Positioner>` element; a smaller value will fallback less often.
  Additionally, the trigger must be at least 20px from the edges of the top and bottom of the viewport, or it will also fall back.
- **Other positioning props are ignored**: Props like `side` or `align` have no effect unless the prop is set to `false` or when in fallback mode.

## Examples

### Typed wrapper component

The following example shows a typed wrapper around the Select component with correct type inference and type safety:

```svelte title="Specifying generic type parameters"
<script lang="ts" generics="Value, Multiple extends boolean | undefined = false">
	import { Select, type SelectRootProps } from '@sveltery/base/select';

	let props: SelectRootProps<Value, Multiple> = $props();
</script>

<Select.Root {...props}>
	<!-- ... -->
</Select.Root>
```

### Formatting the value

By default, the `<Select.Value>` component renders the raw `value`.

Passing the `items` prop to `<Select.Root>` instead renders the matching label for the rendered value:

```svelte title="items prop"
<script lang="ts">
	// @highlight-text "items"
	const items = [
		{ value: null, label: 'Select theme' },
		{ value: 'system', label: 'System default' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
</script>

<!-- @highlight-text "items" -->
<Select.Root {items}>
	<Select.Value />
</Select.Root>
```

A snippet can also be passed as the `children` of `<Select.Value>` to render a formatted value:

```svelte title="Lookup map"
<script lang="ts">
	const items = {
		monospace: 'Monospace',
		serif: 'Serif',
		'san-serif': 'Sans-serif'
	};
</script>

<Select.Value>
	<!-- @highlight-start -->
	{#snippet children(value)}
		<span style:font-family={value as string}>
			{items[value as keyof typeof items]}
		</span>
	{/snippet}
	<!-- @highlight-end -->
</Select.Value>
```

To avoid lookup, [object values](#object-values) for each item can also be used.

### Labeling a select

Use `<Select.Label>` to provide a visible label for the select trigger:

```svelte title="Using Select.Label to label a select"
<Select.Root>
	<!-- @highlight -->
	<Select.Label>Theme</Select.Label>
	<!-- ... -->
</Select.Root>
```

`<Select.Label>` renders a `<div>`, so clicking it focuses the select trigger without opening the popup.

### Placeholder values

To show a placeholder value, use the `placeholder` prop on `<Select.Value>`:

```svelte title="Placeholder item"
<script lang="ts">
	const items = [
		{ value: 'system', label: 'System default' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
</script>

<Select.Root {items}>
	<!-- @highlight -->
	<Select.Value placeholder="Select theme" />
</Select.Root>
```

With placeholders, users cannot clear selected values using the select itself. If the select value should be clearable from the popup (instead of an external "reset" button), use a `null` item rendered in the list itself:

```svelte title="Clearable item"
<script lang="ts">
	const items = [
		// @highlight
		{ value: null, label: 'Select theme' },
		{ value: 'system', label: 'System default' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
</script>

<Select.Root {items}>
	<Select.Value />
</Select.Root>
```

### Multiple selection

Add the `multiple` prop to the `<Select.Root>` component to allow multiple selections.

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';

	const languages = {
		javascript: 'JavaScript',
		typescript: 'TypeScript',
		python: 'Python',
		java: 'Java',
		csharp: 'C#',
		php: 'PHP',
		cpp: 'C++',
		rust: 'Rust',
		go: 'Go',
		swift: 'Swift'
	};

	type Language = keyof typeof languages;

	const values = Object.keys(languages) as Language[];

	function renderValue(value: Language[]) {
		if (value.length === 0) {
			return 'Select languages';
		}

		const firstLanguage = languages[value[0]];
		const additionalLanguages = value.length > 1 ? ` (+${value.length - 1} more)` : '';
		return firstLanguage + additionalLanguages;
	}
</script>

<div class="flex flex-col items-start gap-1">
	<Select.Root multiple defaultValue={['javascript', 'typescript']}>
		<Select.Label class="cursor-default text-sm font-bold text-neutral-950 dark:text-white">
			Languages
		</Select.Label>
		<Select.Trigger
			class="flex h-8 min-w-[14rem] items-center justify-between gap-3 pl-2 pr-1 text-sm leading-none whitespace-nowrap border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 font-normal focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Select.Value
				class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
			>
				{#snippet children(value)}
					{renderValue(value as Language[])}
				{/snippet}
			</Select.Value>
			<Select.Icon>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block"
					><path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" /></svg
				>
			</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class="outline-hidden z-10" sideOffset={4} alignItemWithTrigger={false}>
				<Select.Popup
					class="group max-h-[var(--available-height)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] bg-clip-padding overflow-y-auto border border-neutral-950 bg-white py-1 text-neutral-950 outline-hidden shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					{#each values as value (value)}
						<Select.Item
							{value}
							class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-2.5 pl-2.5 text-sm outline-hidden select-none scroll-my-1 [@media(hover:hover)]:data-highlighted:bg-neutral-950 [@media(hover:hover)]:data-highlighted:text-white dark:[@media(hover:hover)]:data-highlighted:bg-white dark:[@media(hover:hover)]:data-highlighted:text-neutral-950"
						>
							<Select.ItemIndicator class="col-start-1">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									style="display: block"><path d="m2.5 8.5 4 4 7-9" /></svg
								>
							</Select.ItemIndicator>
							<Select.ItemText class="col-start-2">{languages[value]}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</div>
```

### Object values

Select items can use objects as values instead of primitives.
This lets you access the full object in custom render functions, and can avoid needing to specify `items` for lookup.

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';

	interface ShippingMethod {
		id: string;
		name: string;
		duration: string;
		price: string;
	}

	const shippingMethods: ShippingMethod[] = [
		{
			id: 'standard',
			name: 'Standard',
			duration: 'Delivers in 4-6 business days',
			price: '$4.99'
		},
		{
			id: 'express',
			name: 'Express',
			duration: 'Delivers in 2-3 business days',
			price: '$9.99'
		},
		{
			id: 'overnight',
			name: 'Overnight',
			duration: 'Delivers next business day',
			price: '$19.99'
		}
	];
</script>

<div class="flex flex-col items-start gap-1">
	<Select.Root
		defaultValue={shippingMethods[0]}
		itemToStringValue={(item: ShippingMethod) => item.id}
	>
		<Select.Label class="cursor-default text-sm font-bold text-neutral-950 dark:text-white">
			Shipping method
		</Select.Label>
		<Select.Trigger
			class="flex min-h-8 min-w-[16rem] items-center justify-between gap-3 pl-2 pr-1 py-1.5 text-sm leading-none whitespace-nowrap border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 font-normal focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Select.Value>
				{#snippet children(value)}
					{@const method = value as ShippingMethod}
					<span class="flex flex-col items-start gap-0.5">
						<span class="text-sm">{method.name}</span>
						<span class="text-xs text-neutral-600 dark:text-neutral-400">
							{method.duration} ({method.price})
						</span>
					</span>
				{/snippet}
			</Select.Value>
			<Select.Icon>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block"
					><path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" /></svg
				>
			</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class="outline-hidden select-none z-10" sideOffset={4}>
				<Select.Popup
					class="group min-w-[var(--anchor-width)] origin-[var(--transform-origin)] bg-clip-padding border border-neutral-950 bg-white text-neutral-950 outline-hidden shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:translate-y-px data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<Select.ScrollUpArrow
						class="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute data-[side=none]:before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] dark:bg-neutral-950"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"><path d="M12 10H4l4-4.5z" /></svg
						>
					</Select.ScrollUpArrow>
					<Select.List
						class="relative py-1 scroll-py-6 overflow-y-auto max-h-[var(--available-height)]"
					>
						{#each shippingMethods as method (method.id)}
							<Select.Item
								value={method}
								class="group/item grid cursor-default grid-cols-[1rem_1fr] items-start gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
							>
								<Select.ItemIndicator
									class="col-start-1 flex items-center justify-center self-start relative top-[0.4em]"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										style="display: block"><path d="m2.5 8.5 4 4 7-9" /></svg
									>
								</Select.ItemIndicator>
								<Select.ItemText class="col-start-2 flex flex-col gap-0.5">
									<span class="text-sm">{method.name}</span>
									<span
										class="text-xs text-neutral-600 group-data-highlighted/item:text-neutral-400 dark:text-neutral-400 dark:group-data-highlighted/item:text-neutral-600"
									>
										{method.duration} ({method.price})
									</span>
								</Select.ItemText>
							</Select.Item>
						{/each}
					</Select.List>
					<Select.ScrollDownArrow
						class="bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:bottom-[-100%] dark:bg-neutral-950"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"><path d="M12 6H4l4 4.5z" /></svg
						>
					</Select.ScrollDownArrow>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</div>
```

### Grouped

Organize related options with `<Select.Group>` and `<Select.GroupLabel>` to add section headings inside the popup.

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
	import { Field } from '@sveltery/base/field';
	import { Select } from '@sveltery/base/select';

	const groupedProduce = [
		{
			value: 'Fruits',
			items: [
				{ value: 'apple', label: 'Apple' },
				{ value: 'banana', label: 'Banana' },
				{ value: 'mango', label: 'Mango' },
				{ value: 'kiwi', label: 'Kiwi' },
				{ value: 'grape', label: 'Grape' },
				{ value: 'orange', label: 'Orange' },
				{ value: 'strawberry', label: 'Strawberry' },
				{ value: 'watermelon', label: 'Watermelon' }
			]
		},
		{
			value: 'Vegetables',
			items: [
				{ value: 'broccoli', label: 'Broccoli' },
				{ value: 'carrot', label: 'Carrot' },
				{ value: 'cauliflower', label: 'Cauliflower' },
				{ value: 'cucumber', label: 'Cucumber' },
				{ value: 'kale', label: 'Kale' },
				{ value: 'pepper', label: 'Bell pepper' },
				{ value: 'spinach', label: 'Spinach' },
				{ value: 'zucchini', label: 'Zucchini' }
			]
		}
	];
</script>

<Field.Root class="flex flex-col items-start gap-1">
	<Field.Label
		class="cursor-default text-sm font-bold text-neutral-950 dark:text-white"
		nativeLabel={false}
	>
		{#snippet render(props)}
			<div {...props}></div>
		{/snippet}
		Produce
	</Field.Label>
	<Select.Root items={groupedProduce}>
		<Select.Trigger
			class="flex h-8 min-w-44 items-center justify-between gap-3 pl-2 pr-1 text-sm leading-none whitespace-nowrap border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 font-normal focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Select.Value
				class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
				placeholder="Select produce"
			/>
			<Select.Icon>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block"
					><path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" /></svg
				>
			</Select.Icon>
		</Select.Trigger>
		<Select.Portal>
			<Select.Positioner class="outline-hidden select-none z-10" sideOffset={4}>
				<Select.Popup
					class="group min-w-[var(--anchor-width)] origin-[var(--transform-origin)] bg-clip-padding border border-neutral-950 bg-white text-neutral-950 outline-hidden shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:translate-y-px data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<Select.ScrollUpArrow
						class="top-0 z-[2] flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute data-[side=none]:before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] dark:bg-neutral-950"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"><path d="M12 10H4l4-4.5z" /></svg
						>
					</Select.ScrollUpArrow>
					<Select.List
						class="relative py-1 scroll-pt-6 scroll-pb-6 overflow-y-auto max-h-[var(--available-height)]"
					>
						{#each groupedProduce as group, index (group.value)}
							<Select.Group class="block pb-0.5 last:pb-0">
								<Select.GroupLabel
									class="py-1.5 pr-4 pl-[2.125rem] text-sm leading-5 text-neutral-500 select-none dark:text-neutral-400"
								>
									{group.value}
								</Select.GroupLabel>
								{#each group.items as item (item.value)}
									<Select.Item
										value={item.value}
										class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-hidden select-none group-data-[side=none]:pr-12 data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
									>
										<Select.ItemIndicator class="col-start-1">
											<svg
												width="16"
												height="16"
												viewBox="0 0 16 16"
												fill="none"
												stroke="currentColor"
												style="display: block"><path d="m2.5 8.5 4 4 7-9" /></svg
											>
										</Select.ItemIndicator>
										<Select.ItemText class="col-start-2">{item.label}</Select.ItemText>
									</Select.Item>
								{/each}
							</Select.Group>
							{#if index < groupedProduce.length - 1}
								<Select.Separator class="mx-4 my-1 h-px bg-neutral-950 dark:bg-white" />
							{/if}
						{/each}
					</Select.List>
					<Select.ScrollDownArrow
						class="bottom-0 z-[2] flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:bottom-[-100%] dark:bg-neutral-950"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							style="display: block"><path d="M12 6H4l4 4.5z" /></svg
						>
					</Select.ScrollDownArrow>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
</Field.Root>
```

## API reference

<script>
	import { TypesSelect } from './types';
</script>

### Root

<TypesSelect.Root />

### Label

<TypesSelect.Label />

### Trigger

<TypesSelect.Trigger />

### Value

<TypesSelect.Value />

### Icon

<TypesSelect.Icon />

### Backdrop

<TypesSelect.Backdrop />

### Portal

<TypesSelect.Portal />

### Positioner

<TypesSelect.Positioner />

### Popup

<TypesSelect.Popup />

### List

<TypesSelect.List />

### Arrow

<TypesSelect.Arrow />

### Item

<TypesSelect.Item />

### ItemText

<TypesSelect.ItemText />

### ItemIndicator

<TypesSelect.ItemIndicator />

### Group

<TypesSelect.Group />

### GroupLabel

<TypesSelect.GroupLabel />

### ScrollUpArrow

<TypesSelect.ScrollUpArrow />

### ScrollDownArrow

<TypesSelect.ScrollDownArrow />

### Separator

<TypesSelect.Separator />
