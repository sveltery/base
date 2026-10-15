---
title: Toolbar
description: A container for grouping a set of buttons and controls.
---

```svelte demo
<script lang="ts">
	import { Toolbar } from '@sveltery/base/toolbar';

	const item =
		'flex h-8 items-center justify-center rounded-sm px-2.5 text-sm font-medium text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700';
</script>

<Toolbar.Root
	class="flex w-fit items-center gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
>
	<Toolbar.Group class="flex gap-px">
		<Toolbar.Button class={item}>Bold</Toolbar.Button>
		<Toolbar.Button class={item}>Italic</Toolbar.Button>
		<Toolbar.Button class={item}>Underline</Toolbar.Button>
	</Toolbar.Group>
	<Toolbar.Separator class="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
	<Toolbar.Button class={item}>Copy</Toolbar.Button>
	<Toolbar.Link href="/" class="{item} text-gray-900! no-underline! dark:text-gray-100!"
		>Help</Toolbar.Link
	>
</Toolbar.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Toolbar } from '@sveltery/base/toolbar';
</script>

<Toolbar.Root>
	<Toolbar.Button />
	<Toolbar.Link />
	<Toolbar.Group>
		<Toolbar.Button />
		<Toolbar.Button />
	</Toolbar.Group>
	<Toolbar.Separator />
	<Toolbar.Input />
</Toolbar.Root>
```

## Examples

### Keyboard navigation

The toolbar is one tab stop. Press Tab to focus the first item, then use the left and right arrow keys to move between the buttons and links. The up and down arrow keys do the same in a vertical toolbar. Focus wraps from the last item to the first. Set `loopFocus={false}` on the root to stop at the ends.

```svelte
<Toolbar.Root loopFocus={false}>…</Toolbar.Root>
```

### Vertical toolbar

Set `orientation="vertical"` on the root. The root sets `aria-orientation`, and every part gets `data-orientation="vertical"`.

```svelte demo
<script lang="ts">
	import { Toolbar } from '@sveltery/base/toolbar';

	const item =
		'flex h-8 items-center justify-start rounded-sm px-3 text-sm font-medium text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700';
</script>

<Toolbar.Root
	orientation="vertical"
	class="flex w-32 flex-col gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
>
	<Toolbar.Button class={item}>Cut</Toolbar.Button>
	<Toolbar.Button class={item}>Copy</Toolbar.Button>
	<Toolbar.Button class={item}>Paste</Toolbar.Button>
</Toolbar.Root>
```

### Disabled items

Set `disabled` on the root to disable every button, on a group to disable the buttons inside it, or on one button. Links stay active. A disabled button stays in the arrow key order by default, so keyboard users can find it, and it gets `aria-disabled` instead of the `disabled` attribute. Set `focusableWhenDisabled={false}` to remove a disabled button from the order.

```svelte demo
<script lang="ts">
	import { Toolbar } from '@sveltery/base/toolbar';

	let disabled = $state(true);

	const item =
		'flex h-8 items-center justify-center rounded-sm px-2.5 text-sm font-medium text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[disabled]:cursor-not-allowed data-[disabled]:text-gray-400 data-[disabled]:hover:bg-transparent dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:data-[disabled]:text-gray-600';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={disabled} />
		Disable the group
	</label>
	<Toolbar.Root
		class="flex w-fit items-center gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
	>
		<Toolbar.Button class={item}>Undo</Toolbar.Button>
		<Toolbar.Group {disabled} class="flex gap-px">
			<Toolbar.Button class={item}>Bold</Toolbar.Button>
			<Toolbar.Button class={item}>Italic</Toolbar.Button>
		</Toolbar.Group>
		<Toolbar.Button disabled focusableWhenDisabled={false} class={item}>Redo</Toolbar.Button>
		<Toolbar.Link href="/" class="{item} text-gray-900! no-underline! dark:text-gray-100!"
			>Help</Toolbar.Link
		>
	</Toolbar.Root>
</div>
```

### Render a part as another element

Pass a `render` snippet to replace the element of a part. Set `nativeButton={false}` on `Toolbar.Button` when the snippet renders anything but a `<button>`.

```svelte
<Toolbar.Button nativeButton={false}>
	{#snippet render(props, state, children)}
		<span {...props}>{@render children?.()}</span>
	{/snippet}
	Bold
</Toolbar.Button>
```

## Differences from Base UI

- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use Svelte's lowercase names, such as `onclick` and `onkeydown`. Call `event.preventDefault()` in a handler to skip the part's own handler. A `preventDefault()` call in the root's `onkeydown` skips the arrow key navigation.
- The arrow keys follow the reading direction from a [Direction Provider](/utils/direction-provider). In `rtl`, the left arrow moves to the next item.
- The arrow keys in `Toolbar.Input` always move to the next or previous item. Base UI keeps them in the text field until the caret reaches its start or end.
- `Toolbar.Input` takes a plain `value`, not `bind:value`.
- A popup trigger inside a toolbar works as itself but does not join the toolbar's arrow key order. Nothing scrolls the focused item into view, and the parts take no `ref`.

## API reference

### Root

<ApiPart name="toolbar" part="Root" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-orientation` | `horizontal` or `vertical`.           |
| `data-disabled`    | Present when the toolbar is disabled. |

### Button

<ApiPart name="toolbar" part="Button" />

| Attribute          | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `data-orientation` | `horizontal` or `vertical`.                                         |
| `data-disabled`    | Present when the button, its group, or the toolbar is disabled.     |
| `data-focusable`   | Present when `focusableWhenDisabled` is true, which is the default. |

### Group

<ApiPart name="toolbar" part="Group" />

| Attribute          | Description                                        |
| ------------------ | -------------------------------------------------- |
| `data-orientation` | `horizontal` or `vertical`.                        |
| `data-disabled`    | Present when the group or the toolbar is disabled. |

### Link

<ApiPart name="toolbar" part="Link" />

| Attribute          | Description                 |
| ------------------ | --------------------------- |
| `data-orientation` | `horizontal` or `vertical`. |

### Input

<ApiPart name="toolbar" part="Input" />

| Attribute          | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `data-orientation` | `horizontal` or `vertical`.                                         |
| `data-disabled`    | Present when the input, its group, or the toolbar is disabled.      |
| `data-focusable`   | Present when `focusableWhenDisabled` is true, which is the default. |

### Separator

<ApiPart name="toolbar" part="Separator" />

| Attribute          | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `data-orientation` | `horizontal` or `vertical`, perpendicular to the toolbar's. |
