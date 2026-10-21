# Composition

Source: [handbook/composition](https://base.sveltery.dev/handbook/composition.md), [handbook/typescript](https://base.sveltery.dev/handbook/typescript.md).

## Contents

- Assemble every documented part
- `render` is a snippet
- Spread `props` onto one element
- Custom components spread their rest props
- Change the rendered element with `render`
- Nest `render` snippets to stack triggers
- Parts with argument `children` snippets
- Reach the element with `{@attach}`
- Type wrappers with the exported `Props` types

---

## Assemble every documented part

Each component is a set of parts imported as one namespace. The anatomy block at the top of each docs page lists them. Popups need the full chain, or they do not position or portal.

**Incorrect:**

```svelte
<Popover.Root>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Popup>Content</Popover.Popup>
</Popover.Root>
```

**Correct:**

```svelte
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup>Content</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

The same chain applies to Menu, Select, Combobox, Autocomplete, Tooltip, PreviewCard, and ContextMenu. Dialog, AlertDialog, and Drawer have no `Positioner`: their `Portal` holds a `Backdrop` and the `Popup`, and Dialog adds an optional `Viewport` around the `Popup`. Read the component's anatomy instead of assuming.

## `render` is a snippet

Base UI's `render` prop takes a React element or a function. In Sveltery Base, `render` is always a [snippet](https://svelte.dev/docs/svelte/snippet) that receives three arguments: the props to spread, the part's state, and the part's children.

**Incorrect:**

```svelte
<Menu.Trigger render={MyButton}>Open menu</Menu.Trigger>
```

**Correct:**

```svelte
<Menu.Trigger>
	{#snippet render(props, state, children)}
		<MyButton {...props}>{@render children?.()}</MyButton>
	{/snippet}
	Open menu
</Menu.Trigger>
```

A snippet declared outside the part works too: `<Popover.Positioner render={renderPositioner} />`. Its type is `RenderSnippet<Element, State>` from `@sveltery/base/types`.

## Spread `props` onto one element

`props` carries the part's ARIA attributes, data attributes, event handlers, and an attachment that gives the part its element. Spread it onto exactly one element. A missing spread breaks focus, keyboard handling, and positioning without an error.

**Incorrect:**

```svelte
<Switch.Thumb>
	{#snippet render(props, state)}
		<span class="Thumb">{state.checked ? 'On' : 'Off'}</span>
	{/snippet}
</Switch.Thumb>
```

**Correct:**

```svelte
<Switch.Thumb>
	{#snippet render(props, state)}
		<span {...props} class="Thumb">{state.checked ? 'On' : 'Off'}</span>
	{/snippet}
</Switch.Thumb>
```

`state` is the same object documented as the part's `State` type, so the snippet can render different content per state.

## Custom components spread their rest props

Svelte has no refs to forward. A component used in a `render` snippet must spread all the props it does not use onto its root DOM element, and must render `children`.

```svelte
<!-- MyButton.svelte -->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { children, size = 'md', ...rest }: HTMLButtonAttributes & { size?: 'sm' | 'md' } = $props();
</script>

<button {...rest} data-size={size}>{@render children?.()}</button>
```

## Change the rendered element with `render`

Each part renders the most appropriate element by default. Use `render` to swap it when the page needs a different element, such as a heading level.

```svelte
<Accordion.Header>
	{#snippet render(props, state, children)}
		<h2 {...props}>{@render children?.()}</h2>
	{/snippet}
	<Accordion.Trigger>What is Sveltery Base?</Accordion.Trigger>
</Accordion.Header>
```

Parts that render a `<button>` by default expect a button. If you render a non-button element, check the part's `nativeButton` prop in its API table.

## Nest `render` snippets to stack triggers

To make one element act as a tooltip trigger and a dialog trigger, pass each part's props into the next part.

```svelte
<Tooltip.Trigger>
	{#snippet render(tooltipProps)}
		<Dialog.Trigger {...tooltipProps}>
			{#snippet render(dialogProps, state, children)}
				<MyButton {...dialogProps}>{@render children?.()}</MyButton>
			{/snippet}
			Edit
		</Dialog.Trigger>
	{/snippet}
</Tooltip.Trigger>
```

To combine your own props with a part's props, use `mergeProps` from `@sveltery/base/merge-props`. It joins `class`, `style`, event handlers, and attachments instead of overwriting them.

## Parts with argument `children` snippets

A few parts pass values to `children`. Declare the snippet with its parameters instead of reading the value elsewhere.

```svelte
<Combobox.List>
	<Combobox.Collection>
		{#snippet children(item: Fruit)}
			<Combobox.Item value={item}>{item.label}</Combobox.Item>
		{/snippet}
	</Combobox.Collection>
</Combobox.List>

<Select.Value>
	{#snippet children(value)}
		{labels[value as string] ?? 'Choose a fruit'}
	{/snippet}
</Select.Value>
```

Other examples: `Progress.Value` and `Meter.Value` (formatted value, raw value), `Slider.Value` (formatted values, values), `Field.Validity` (validity state), and the `Root` of Dialog, Popover, Menu, Tooltip, and PreviewCard (`{ payload }` from the trigger that opened it). The component's API table lists the arguments.

## Reach the element with `{@attach}`

There is no `ref` prop. To get a part's DOM element, attach a function:

```svelte
<Field.Control
	{@attach (node: HTMLElement) => {
		inputEl = node as HTMLInputElement;
	}}
/>
```

Popup roots expose imperative methods through `bind:this` on the root, in place of Base UI's `actionsRef`.

## Type wrappers with the exported `Props` types

Types are named exports that join the component and the part: `Tooltip.Root.Props` in Base UI is `TooltipRootProps`. Re-bind bindable props so `bind:` on your wrapper reaches the part.

```svelte
<!-- MyTooltip.svelte -->
<script lang="ts">
	import { Tooltip, type TooltipRootProps } from '@sveltery/base/tooltip';

	let { open = $bindable(), ...props }: TooltipRootProps = $props();
</script>

<Tooltip.Root bind:open {...props} />
```
