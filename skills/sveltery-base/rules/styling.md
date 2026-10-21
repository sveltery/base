# Styling

Source: [handbook/styling](https://base.sveltery.dev/handbook/styling.md), [handbook/animation](https://base.sveltery.dev/handbook/animation.md).

## Contents

- Components are unstyled
- Style states with data attributes
- `class` and `style` are not functions of state
- Use `:global(...)` in `<style>` blocks
- Use the exposed CSS variables
- Animate with `data-starting-style` and `data-ending-style`
- Isolate the app root for portals

---

## Components are unstyled

Sveltery Base ships no CSS. Every part that renders an element takes `class` and `style`, and works with Tailwind CSS, CSS Modules, plain CSS, or a framework-agnostic CSS-in-JS library. `class` accepts any Svelte class value: a string, an array, or an object.

```svelte
<Switch.Thumb class={['SwitchThumb', compact && 'SwitchThumb-compact']} />
```

## Style states with data attributes

Parts set `data-*` attributes for their state, such as `data-checked`, `data-unchecked`, `data-open`, `data-closed`, `data-highlighted`, `data-pressed`, `data-disabled`, `data-invalid`, and `data-side`. The API table on each docs page lists them. Style those attributes instead of mirroring state into classes.

**Incorrect:**

```svelte
<script lang="ts">
	let checked = $state(false);
</script>

<Switch.Root bind:checked class={checked ? 'bg-green-600' : 'bg-neutral-300'}>
	<Switch.Thumb />
</Switch.Root>
```

**Correct:**

```svelte
<Switch.Root class="bg-neutral-300 data-checked:bg-green-600">
	<Switch.Thumb />
</Switch.Root>
```

In plain CSS: `.Switch[data-checked] { background-color: green; }`.

Each component also exports its attribute names as constants, such as `MenuItemDataAttributes.highlighted`, for CSS-in-JS.

## `class` and `style` are not functions of state

Base UI's `className` and `style` can be functions of state. In Sveltery Base they cannot. Use a data attribute, or render the element yourself with a `render` snippet, which receives the state.

**Incorrect:**

```svelte
<Tabs.Tab class={(state) => (state.active ? 'Tab Tab-active' : 'Tab')} value="a">A</Tabs.Tab>
```

**Correct:**

```svelte
<Tabs.Tab class="Tab" value="a">A</Tabs.Tab>

<style>
	:global(.Tab[data-active]) {
		font-weight: 600;
	}
</style>
```

## Use `:global(...)` in `<style>` blocks

Svelte scopes `<style>` rules to elements in the component's own markup. A part renders its element inside the library's component, and popups render in a portal, so a scoped `.Item` selector never matches and Svelte warns that it is unused.

**Incorrect:**

```svelte
<Menu.Item class="Item">Add to Library</Menu.Item>

<style>
	.Item[data-highlighted] {
		background: black;
	}
</style>
```

**Correct:**

```svelte
<Menu.Item class="Item">Add to Library</Menu.Item>

<style>
	:global(.Item[data-highlighted]) {
		background: black;
	}
</style>
```

Elements you write inside a `render` snippet belong to your component, so scoped rules reach them. Keyframes used from a global selector need the `-global-` prefix, such as `@keyframes -global-scaleIn`.

## Use the exposed CSS variables

Positioned popups expose CSS variables on the `Positioner` and `Popup`, such as `--available-height`, `--available-width`, `--anchor-width`, `--anchor-height`, and `--transform-origin`. Other components expose their own, such as accordion and collapsible panel sizes. Check the component's API table for the exact names.

```css
.Popup {
	max-height: var(--available-height);
	transform-origin: var(--transform-origin);
}
```

With Tailwind CSS v4: `max-h-(--available-height) origin-(--transform-origin)`.

## Animate with `data-starting-style` and `data-ending-style`

Popups stay mounted until their exit animation ends. Prefer CSS transitions, because they can reverse midway when the user closes a popup that is still opening.

```css
.Popup {
	transition:
		transform 150ms,
		opacity 150ms;

	&[data-starting-style],
	&[data-ending-style] {
		opacity: 0;
		transform: scale(0.9);
	}
}
```

For keyframe animations, use `[data-open]` and `[data-closed]`. For Svelte transitions or the Web Animations API, read [handbook/animation](https://base.sveltery.dev/handbook/animation.md), which covers `keepMounted` and manual unmounting.

## Isolate the app root for portals

Popups portal to `<body>`. Give the element that wraps the app `isolation: isolate` so popups stack above the page without `z-index` fights. In a SvelteKit app, that is the element that wraps `%sveltekit.body%` in `src/app.html`; remove its `style="display: contents"`, which cannot create a stacking context. See [overview/quick-start](https://base.sveltery.dev/overview/quick-start.md).
