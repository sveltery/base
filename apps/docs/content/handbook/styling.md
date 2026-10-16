---
title: Styling
description: A guide to styling Sveltery Base components with your preferred styling engine.
order: 1
---

Sveltery Base components are unstyled, don't bundle CSS, and are compatible with Tailwind, CSS Modules, CSS-in-JS, or any other styling solution you prefer.
You retain total control of your styling layer.

## Style hooks

### CSS classes

Components that render an HTML element accept a `class` prop to style the element with CSS classes.

```svelte title="switch.svelte"
<Switch.Thumb class="SwitchThumb" />
```

The prop also accepts any Svelte class value, such as an array or an object. Base UI's `className` can also be a function of the component's state. Sveltery Base's `class` cannot, so style each state through its [data attribute](#data-attributes).

```svelte title="switch.svelte"
<Switch.Thumb class={['SwitchThumb', compact && 'SwitchThumb-compact']} />
```

### Data attributes

Components provide data attributes designed for styling their states. For example, [Switch](/components/switch) can be styled using its `[data-checked]` and `[data-unchecked]` attributes, among others.

```css title="switch.css"
.SwitchThumb[data-checked] {
	background-color: green;
}
```

### CSS variables

Components expose CSS variables to aid in styling, often containing dynamic numeric values to be used in sizing or transform calculations. For example, [Popover](/components/popover) exposes CSS variables on its `Popup` component like `--available-height` and `--anchor-width`.

```css title="popover.css"
.Popup {
	max-height: var(--available-height);
}
```

Check out each component's API reference for a complete list of available data attributes and CSS variables.

### Style prop

Components that render an HTML element accept a `style` prop to style the element with a CSS string.

```svelte title="switch.svelte"
<Switch.Thumb style="height: 100px" />
```

Base UI's `style` can also be a function of the component's state. Sveltery Base's `style` cannot. To style an element from the component's state, render the element yourself with a [render snippet](/handbook/composition#render-function), which receives the state.

## Tailwind CSS

Apply Tailwind CSS classes to each part via the `class` prop.

```svelte title="menu.svelte"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-8 items-center justify-center rounded-md border border-neutral-950 bg-white px-3 text-sm text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-pressed:bg-neutral-800 dark:focus-visible:outline-white"
	>
		Song
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8}>
			<Menu.Popup
				class="origin-(--transform-origin) border border-neutral-950 bg-white py-1 text-neutral-950 outline-hidden transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white"
			>
				<Menu.Item
					class="flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
				>
					Add to Library
				</Menu.Item>
				<Menu.Item
					class="flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
				>
					Add to Playlist
				</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

## CSS Modules

Apply custom CSS classes to each part via the `class` prop.
Then style those classes in a CSS Modules file. Vite supports CSS Modules in Svelte components.

```svelte title="menu.svelte"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './menu.module.css';
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>Song</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8}>
			<Menu.Popup class={styles.Popup}>
				<Menu.Item class={styles.Item}>Add to Library</Menu.Item>
				<Menu.Item class={styles.Item}>Add to Playlist</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

## Svelte style blocks

Svelte scopes the rules in a component's `<style>` block to the elements in that component's markup. A part renders its element inside the library's component, so a scoped selector such as `.Item` does not reach it, and Svelte warns that the selector is unused. Wrap the selector in `:global(...)`:

```svelte
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
</script>

<Menu.Root>
	<Menu.Trigger class="Button">Song</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="Positioner" sideOffset={8}>
			<Menu.Popup class="Popup">
				<Menu.Item class="Item">Add to Library</Menu.Item>
				<Menu.Item class="Item">Add to Playlist</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<style>
	:global(.Item[data-highlighted]) {
		outline: 1px solid currentColor;
	}
</style>
```

Elements that you write in a [render snippet](/handbook/composition) belong to your component's markup, so scoped rules apply to them without `:global`.

## CSS-in-JS

Svelte has no `styled()` wrapper for components. Generate a class for each part with a framework-agnostic CSS-in-JS library, such as [Emotion](https://emotion.sh/docs/@emotion/css)'s `@emotion/css`, then apply it via the `class` prop.

```svelte title="menu.svelte"
<script lang="ts">
	import { Menu, MenuItemDataAttributes, MenuPositionerCssVariables } from '@sveltery/base/menu';
	import { css } from '@emotion/css';

	const trigger = css`
		/* Button styles */
	`;

	const positioner = css`
		/* Positioner styles */
	`;

	const popup = css`
		max-height: var(${MenuPositionerCssVariables.availableHeight});
	`;

	const item = css`
		&[${MenuItemDataAttributes.highlighted}] {
			outline: 1px solid currentColor;
		}
	`;
</script>

<Menu.Root>
	<Menu.Trigger class={trigger}>Song</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={positioner}>
			<Menu.Popup class={popup}>
				<Menu.Item class={item}>Add to Library</Menu.Item>
				<Menu.Item class={item}>Add to Playlist</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```
