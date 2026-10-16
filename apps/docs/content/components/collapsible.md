---
title: Collapsible
description: A collapsible panel controlled by a button.
---

```svelte demo
<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';
</script>

<Collapsible.Root
	class="flex min-h-36 w-48 flex-col justify-center text-neutral-950 dark:text-white"
>
	<Collapsible.Trigger
		class="group flex h-8 items-center justify-between gap-2 rounded-none border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 pl-3 pr-2 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Recovery keys
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			class="block transition-transform duration-100 ease-[ease-out] group-data-panel-open:rotate-90"
		>
			<path d="M6 12V4l4.5 4z" />
		</svg>
	</Collapsible.Trigger>
	<Collapsible.Panel
		class="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0"
	>
		<div class="flex flex-col gap-2 px-3.5 py-2">
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

### Hidden until found

The `hiddenUntilFound` prop hides the closed panel with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search its contents with find-in-page—<kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>Cmd</kbd>+<kbd>F</kbd> on macOS)—and reveal the panel when a match is found. The closed panel always remains mounted in the DOM, which also makes its contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep the panel hidden until its trigger opens it, and find-in-page skips over the contents.

```svelte
<Collapsible.Root>
	<Collapsible.Trigger>Shipping details</Collapsible.Trigger>
	<Collapsible.Panel hiddenUntilFound>Standard shipping takes 3–5 business days.</Collapsible.Panel>
</Collapsible.Root>
```

See the [Accordion example](/components/accordion#hidden-until-found) for an interactive demo.

## API reference

### Root

<ApiPart name="collapsible" part="Root" />

| Attribute             | Description                                       |
| --------------------- | ------------------------------------------------- |
| `data-open`           | Present when the collapsible is open.             |
| `data-closed`         | Present when the collapsible is closed.           |
| `data-disabled`       | Present when the collapsible is disabled.         |
| `data-starting-style` | Present when the collapsible begins animating in. |
| `data-ending-style`   | Present when the collapsible is animating out.    |

### Trigger

<ApiPart name="collapsible" part="Trigger" />

| Attribute         | Description                                 |
| ----------------- | ------------------------------------------- |
| `data-panel-open` | Present when the collapsible panel is open. |
| `data-disabled`   | Present when the collapsible is disabled.   |

### Panel

<ApiPart name="collapsible" part="Panel" />

| Attribute             | Description                                   |
| --------------------- | --------------------------------------------- |
| `data-open`           | Present when the collapsible panel is open.   |
| `data-closed`         | Present when the collapsible panel is closed. |
| `data-starting-style` | Present when the panel begins animating in.   |
| `data-ending-style`   | Present when the panel is animating out.      |

| CSS variable                 | Description                     |
| ---------------------------- | ------------------------------- |
| `--collapsible-panel-height` | The collapsible panel's height. |
| `--collapsible-panel-width`  | The collapsible panel's width.  |
