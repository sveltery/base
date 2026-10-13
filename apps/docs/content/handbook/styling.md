---
title: Styling
description: Learn how to style Sveltery Base components with Tailwind CSS, plain CSS, or any other way of writing CSS.
order: 1
---

Sveltery Base components render no styles and ship no CSS. You keep full control of the styling layer. Each part renders one HTML element, and you style that element through the hooks on this page.

## Style hooks

### CSS classes

Each part that renders an HTML element takes a `class` prop:

```svelte
<Switch.Thumb class="SwitchThumb" />
```

`class` takes any Svelte class value: a string, an array, or an object. Svelte joins the truthy entries into one class list:

```svelte
<Switch.Thumb class={['SwitchThumb', compact && 'SwitchThumb-compact']} />
<Switch.Thumb class={{ SwitchThumb: true, 'SwitchThumb-compact': compact }} />
```

Base UI also accepts a function of the part's state for `className`. In Sveltery Base, `class` does not take a function. Style a state through its data attribute, or read the state in a [`render` snippet](#state-in-a-render-snippet).

### Data attributes

Parts set data attributes for their states. For example, [Switch](/components/switch) sets `data-checked` or `data-unchecked` on the root and the thumb:

```css
.SwitchThumb[data-checked] {
	background-color: green;
}
```

### CSS variables

Some parts set CSS variables with values measured at runtime, such as sizes and positions. For example, `Popover.Positioner` sets `--available-height` and `--anchor-width`, and `Collapsible.Panel` sets `--collapsible-panel-height`:

```css
.Popup {
	max-height: var(--available-height);
}
```

Each component page lists the data attributes and CSS variables of every part.

### Style prop

Each part that renders an HTML element takes a `style` string:

```svelte
<Switch.Thumb style="height: 100px" />
```

Some parts set inline styles of their own, such as the position of `Popover.Positioner`. Your `style` is merged with them, and your declaration wins when both set the same property. `style` does not take an object or a function of state.

Svelte's `style:` directive works on elements, not on components. To use it, render your own element with a [`render` snippet](/handbook/composition).

## Tailwind CSS

Put Tailwind CSS classes on each part with `class`. Use data attribute variants, such as `data-[checked]:`, to style a state. Use `group-data-[...]:` to style a child element from its parent's state.

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<Switch.Root
	aria-label="Notifications"
	class="relative flex h-6 w-10 rounded-full bg-gray-200 p-px transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-700 dark:data-[checked]:bg-gray-100"
>
	<Switch.Thumb
		class="aspect-square h-full rounded-full bg-white shadow transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-900"
	/>
</Switch.Root>
```

Tailwind CSS reads class names from your source files, so write each class name in full. A class name built from a variable at runtime is not generated.

## Plain CSS

Put class names on the parts, then style them in a global stylesheet. To keep the styles in your component, use a `<style>` block with `:global`.

Svelte scopes the styles in a `<style>` block to the elements in that component's markup. A part's element is rendered inside the library component, so a plain `.SwitchThumb` selector in your component does not match it. Svelte also warns that the selector is unused. Wrap the selector in `:global(...)`:

```svelte
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<div class="settings">
	<Switch.Root class="Switch">
		<Switch.Thumb class="SwitchThumb" />
	</Switch.Root>
</div>

<style>
	.settings :global(.Switch) {
		display: flex;
		width: 2.5rem;
		height: 1.5rem;
		border-radius: 999px;
		background-color: #e5e7eb;
	}

	.settings :global(.Switch[data-checked]) {
		background-color: #111827;
	}
</style>
```

The `.settings` ancestor keeps these rules from applying elsewhere in the app. That works for parts that render in place. A portaled part, such as `Popover.Popup` or `Dialog.Popup`, renders in `<body>`, outside your component's elements. Select it with a class of its own, such as `:global(.Popup)`.

Elements you write in a `render` snippet belong to your component's markup. Scoped styles apply to them without `:global`.

## State in a render snippet

A `render` snippet receives the part's state as its second argument. Use it to render different content for each state:

```svelte demo
<script lang="ts">
	import { Switch } from '@sveltery/base/switch';
</script>

<Switch.Root
	aria-label="Dark mode"
	class="relative flex h-6 w-10 rounded-full bg-gray-200 p-px transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-700 dark:data-[checked]:bg-gray-100"
>
	<Switch.Thumb
		class="flex aspect-square h-full items-center justify-center rounded-full bg-white text-xs shadow transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-900"
	>
		{#snippet render(props, state)}
			<span {...props}>{state.checked ? '☾' : '☀'}</span>
		{/snippet}
	</Switch.Thumb>
</Switch.Root>
```

The `class` you pass to the part arrives in `props`, so spreading `props` applies it to your element. The state is the same object that the part's data attributes come from. Each component page lists the state of every part in its API reference. [Composition](/handbook/composition) explains the rest of the snippet signature.
