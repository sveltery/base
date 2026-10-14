---
title: Menubar
description: A row of menu triggers that keeps one menu open at a time, like a desktop application menu.
---

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import { Menubar } from '@sveltery/base/menubar';

	const menus = [
		{ label: 'File', items: ['New', 'Open', 'Save'] },
		{ label: 'Edit', items: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'] },
		{ label: 'View', items: ['Zoom In', 'Zoom Out', 'Full Screen'] }
	];
	const trigger =
		'h-8 rounded px-3 text-sm font-medium text-gray-900 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100 data-[popup-open]:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 dark:data-[popup-open]:bg-gray-800';
	const item =
		'flex cursor-default items-center py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<Menubar
	class="flex rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-900"
>
	{#each menus as menu (menu.label)}
		<Menu.Root>
			<Menu.Trigger class={trigger}>{menu.label}</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner sideOffset={6}>
					<Menu.Popup
						class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
					>
						{#each menu.items as label (label)}
							<Menu.Item class={item}>{label}</Menu.Item>
						{/each}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	{/each}
</Menubar>
```

## Anatomy

Import the component and place `Menu` parts inside it:

```svelte
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import { Menubar } from '@sveltery/base/menubar';
</script>

<Menubar>
	<Menu.Root>
		<Menu.Trigger />
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Item />
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menubar>
```

## Behavior

Each `Menu.Trigger` in a menubar has the `menuitem` role, and the menubar keeps a single tab stop. The arrow keys along the menubar's orientation move between triggers, and Home and End move to the first and last trigger. Arrow keys skip a disabled trigger.

A trigger opens its menu on a press, with Enter or Space, or with the arrow key that points into the menu: ArrowDown in a horizontal menubar, and ArrowRight (ArrowLeft in right-to-left text) in a vertical one. While a menu is open:

- Hovering another trigger opens that trigger's menu and closes the open one.
- The left and right arrow keys in a horizontal menubar move to the neighboring trigger and open its menu.
- Escape closes the menu and returns focus to its trigger.

A menu placed in a menubar opens below a horizontal menubar and beside a vertical one, aligned to the start of its trigger.

### Orientation

Set `orientation="vertical"` for a menubar stacked in a column. Set `loopFocus={false}` to stop the arrow keys at the first and last triggers.

### Modal

The menubar is modal by default. While one of its menus is open, the page does not scroll and pointer interaction outside the menus and the menubar is blocked. The menubar itself stays interactive, so the other triggers can still be hovered and pressed. Set `modal={false}` to keep the page interactive.

### Disabled

Set `disabled` to disable every trigger and every item of the menus in the menubar.

### Detached triggers

`Menu.Trigger` can sit in a menubar with a `handle` while its `Menu.Root` renders elsewhere, as in [Menu](/components/menu#detached-triggers). Several triggers that share one root switch that root between them.

## Differences from Base UI

- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names, such as `onkeydown`.
- The `MenubarDataAttributes` namespace is not exported. The attribute names are the same.
- Refs are not supported.

## API reference

### Menubar

<ApiPart name="menubar" part="Menubar" />

| Attribute               | Description                                 |
| ----------------------- | ------------------------------------------- |
| `data-orientation`      | `horizontal` or `vertical`.                 |
| `data-modal`            | Present when the menubar is modal.          |
| `data-has-submenu-open` | Present when a menu in the menubar is open. |
