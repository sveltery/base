---
title: Collapsible
description: A collapsible panel controlled by a button.
---

```svelte demo
<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';
</script>

<Collapsible.Root
	class="flex min-h-36 w-56 flex-col justify-center text-gray-900 dark:text-gray-100"
>
	<Collapsible.Trigger
		class="group flex items-center gap-2 rounded-sm bg-gray-100 px-2 py-1 text-sm font-medium hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		<svg
			viewBox="0 0 10 10"
			class="size-2.5 transition-transform group-data-[panel-open]:rotate-90"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M3.5 9L7.5 5L3.5 1" stroke="currentColor" />
		</svg>
		Recovery keys
	</Collapsible.Trigger>
	<Collapsible.Panel
		class="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all duration-150 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
	>
		<div
			class="mt-1 flex cursor-text flex-col gap-2 rounded-sm bg-gray-100 py-2 pl-7 dark:bg-gray-800"
		>
			<div>alien-bean-pasta</div>
			<div>wild-irish-burrito</div>
			<div>horse-battery-staple</div>
		</div>
	</Collapsible.Panel>
</Collapsible.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';
</script>

<Collapsible.Root>
	<Collapsible.Trigger />
	<Collapsible.Panel />
</Collapsible.Root>
```

## Examples

### Open state

Bind `open` to read and change whether the panel is open. Without `bind:`, the collapsible manages its own state, and a value you pass sets the initial state.

```svelte demo
<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';

	let open = $state(true);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={open} />
		Open from outside
	</label>
	<Collapsible.Root bind:open class="w-56">
		<Collapsible.Trigger
			class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			{open ? 'Hide' : 'Show'} details
		</Collapsible.Trigger>
		<Collapsible.Panel class="mt-1 rounded-sm bg-gray-100 px-3 py-2 dark:bg-gray-800">
			The panel is {open ? 'open' : 'closed'}.
		</Collapsible.Panel>
	</Collapsible.Root>
</div>
```

### Hidden until found

Set `hiddenUntilFound` on the panel to keep its content in the DOM while it is closed. The browser's find-in-page can then find the text and open the panel. The panel uses `hidden="until-found"`, so the content is still hidden from view and from assistive technology until it opens.

```svelte
<Collapsible.Panel hiddenUntilFound>…</Collapsible.Panel>
```

### Animate the panel

The panel sets `--collapsible-panel-height` and `--collapsible-panel-width` to its measured size. Transition `height` to the variable, and use `[data-starting-style]` and `[data-ending-style]` for the closed size:

```css
.panel {
	height: var(--collapsible-panel-height);
	overflow: hidden;
	transition: height 150ms ease-out;
}

.panel[data-starting-style],
.panel[data-ending-style] {
	height: 0;
}
```

## Differences from Base UI

- `open` is one bindable prop. Use `bind:open` instead of `open` and `onOpenChange` together. There is no `defaultOpen` prop: pass `open` without `bind:` to set the initial state.
- `onOpenChange` runs before the state changes. Call `eventDetails.cancel()` to keep the panel as it is.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.

## API reference

### Root

<ApiPart name="collapsible" part="Root" />

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-open`     | Present when the panel is open.           |
| `data-closed`   | Present when the panel is closed.         |
| `data-disabled` | Present when the collapsible is disabled. |

### Trigger

<ApiPart name="collapsible" part="Trigger" />

| Attribute         | Description                               |
| ----------------- | ----------------------------------------- |
| `data-panel-open` | Present when the panel is open.           |
| `data-disabled`   | Present when the collapsible is disabled. |

### Panel

<ApiPart name="collapsible" part="Panel" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-open`           | Present when the panel is open.          |
| `data-closed`         | Present when the panel is closed.        |
| `data-starting-style` | Present when the panel is animating in.  |
| `data-ending-style`   | Present when the panel is animating out. |

| CSS variable                 | Description         |
| ---------------------------- | ------------------- |
| `--collapsible-panel-height` | The panel's height. |
| `--collapsible-panel-width`  | The panel's width.  |
