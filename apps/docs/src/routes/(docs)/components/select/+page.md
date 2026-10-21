# Select

<Subtitle>
  A common form component for choosing a predefined value in a dropdown menu.
</Subtitle>

<Meta name="description" content="A common form component for choosing a predefined value in a dropdown menu." />

<DemoSelectHero />

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

<DemoSelectMultiple />

### Object values

Select items can use objects as values instead of primitives.
This lets you access the full object in custom render functions, and can avoid needing to specify `items` for lookup.

<DemoSelectObjectValues />

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

<DemoSelectGrouped />

### Native attributes and events

`<Select.Root>` renders a hidden `<select>` that submits the value. It is `multiple` when the select is. Native `<select>` attributes and handlers on `<Select.Root>`, such as `name`, `form`, `autocomplete`, `oninput` and `onchange`, go to that hidden `<select>`. It fires real `input` and `change` events when the value changes, so read the value from the event or use `bind:value`:

```svelte title="Reading the value"
<script lang="ts">
	let sort = $state<string | null>('newest');
</script>

<Select.Root {items} name="sort" bind:value={sort} onchange={() => refresh()}>
	<!-- ... -->
</Select.Root>
```

The server renders the current options as `selected`, so a form submits the value without JavaScript. While there is no value, the first option is empty, so a `required` select reports `valueMissing`. The popup needs JavaScript to open, so the hidden `<select>` gets `required` only once the page is interactive.

### Form integration

Use [Field](/components/field) to handle label associations and form integration. A `<Field.Label>` next to the trigger needs `nativeLabel={false}`, because the trigger is a button:

```svelte title="Using Select in a form"
<Form>
	<Field.Root name="language">
		<Field.Label nativeLabel={false}>Language</Field.Label>
		<Select.Root {items} required>
			<!-- ... -->
		</Select.Root>
		<Field.Error />
	</Field.Root>
</Form>
```

With a SvelteKit remote form, spread the field's `select` props onto `<Select.Root>`. A multiple select takes `select multiple`. The spread names the hidden `<select>` and holds its value, and a spread of another input kind is a type error:

```svelte title="Using Select in a remote form"
<Form form={settings}>
	<Field.Root name="language">
		<Field.Label nativeLabel={false}>Language</Field.Label>
		<!-- @highlight -->
		<Select.Root {...settings.fields.language.as('select')} {items} required>
			<!-- ... -->
		</Select.Root>
		<Field.Error />
	</Field.Root>
</Form>
```

## API reference

<script>
	import { DemoSelectHero } from './demos/hero';
	import { DemoSelectMultiple } from './demos/multiple';
	import { DemoSelectObjectValues } from './demos/object-values';
	import { DemoSelectGrouped } from './demos/grouped';
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
