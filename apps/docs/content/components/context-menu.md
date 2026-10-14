---
title: Context Menu
description: A menu that appears at the pointer on right click or long press.
---

```svelte demo
<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';

	const item =
		'flex cursor-default items-center py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900 dark:data-[highlighted]:text-gray-900 dark:data-[highlighted]:before:bg-gray-100';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="flex h-48 w-72 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-900 select-none dark:border-gray-600 dark:text-gray-100"
	>
		Right click here
	</ContextMenu.Trigger>
	<ContextMenu.Portal>
		<ContextMenu.Positioner>
			<ContextMenu.Popup
				class="origin-[var(--transform-origin)] rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 transition-[opacity] data-[ending-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<ContextMenu.Item class={item}>Add to Library</ContextMenu.Item>
				<ContextMenu.Item class={item}>Add to Playlist</ContextMenu.Item>
				<ContextMenu.Separator class="mx-4 my-1.5 h-px bg-gray-200 dark:bg-gray-700" />
				<ContextMenu.Item class={item}>Play Next</ContextMenu.Item>
				<ContextMenu.Item class={item}>Play Last</ContextMenu.Item>
				<ContextMenu.Separator class="mx-4 my-1.5 h-px bg-gray-200 dark:bg-gray-700" />
				<ContextMenu.Item class={item}>Favorite</ContextMenu.Item>
				<ContextMenu.Item class={item}>Share</ContextMenu.Item>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
```

## Usage guidelines

- **Use context menus as an enhancement.** Users may not find a context menu or be able to open it, especially on touch devices or with assistive technology. Give every action in a context menu a visible control too, such as a [Menu](/components/menu) button.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { ContextMenu } from '@sveltery/base/context-menu';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger />
	<ContextMenu.Portal>
		<ContextMenu.Backdrop />
		<ContextMenu.Positioner>
			<ContextMenu.Popup>
				<ContextMenu.Arrow />
				<ContextMenu.Item />
				<ContextMenu.LinkItem />
				<ContextMenu.Separator />

				<ContextMenu.SubmenuRoot>
					<ContextMenu.SubmenuTrigger />
				</ContextMenu.SubmenuRoot>

				<ContextMenu.Group>
					<ContextMenu.GroupLabel />
				</ContextMenu.Group>

				<ContextMenu.RadioGroup>
					<ContextMenu.RadioItem>
						<ContextMenu.RadioItemIndicator />
					</ContextMenu.RadioItem>
				</ContextMenu.RadioGroup>

				<ContextMenu.CheckboxItem>
					<ContextMenu.CheckboxItemIndicator />
				</ContextMenu.CheckboxItem>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
</ContextMenu.Root>
```

Every part except `Root` and `Trigger` is the [Menu](/components/menu) part of the same name. `ContextMenu.Positioner` takes the `Menu.Positioner` props, as the [Positioner](#positioner) section lists. [Menu](/components/menu#examples) shows examples that apply to the context menu too.

## Behavior

A right click on `ContextMenu.Trigger` opens the menu at the pointer, and the browser's own context menu stays closed. On a touch screen, a press held for 500ms opens it. A finger that moves more than 10px, lifts, or adds a second touch cancels the press.

The menu opens below the pointer, aligned to its start, with its corner just under the cursor. The release of the right button that opened the menu does not activate the item under the cursor. Releasing the button outside the menu more than 500ms after it opened closes the menu.

While open, the menu is modal: the page does not scroll, and a backdrop blocks pointer interaction with the rest of the page. A right click on the trigger area moves the menu to the new pointer position. A press outside the menu, Escape, or a click on an item closes it, and Escape returns focus to the element that was focused before the menu opened.

### Nested context menus

A `ContextMenu.Root` inside another context menu's trigger, or inside one of its items, is a separate context menu. A right click opens only the innermost one.

### Disabled

Set `disabled` on `ContextMenu.Root` to stop the menu from opening. The browser's own context menu then works as usual.

## Differences from Base UI

- `open` is a bindable prop on `ContextMenu.Root`. Use `bind:open` instead of `open` and `defaultOpen` together. Pass it without `bind:` to set the initial state.
- `onOpenChange` runs before the state changes. Call `eventDetails.cancel()` to keep the menu as it is.
- `actionsRef` is not available. Use `bind:this` on `ContextMenu.Root`, which exposes `close()` and `unmount()`.
- The deprecated `closeParentOnEsc` on `ContextMenu.Root` and `positionMethod` on `ContextMenu.Positioner` are not accepted. They have no effect upstream.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names, such as `oncontextmenu`. Call `event.preventDefault()` in your `oncontextmenu` to skip the trigger's own handler.
- The `ContextMenu*DataAttributes` and `ContextMenuPositionerCssVariables` namespaces are not exported. The names are the same as in [Menu](/components/menu).
- Refs are not supported.

## API reference

### Root

<ApiPart name="context-menu" part="Root" />

`ContextMenu.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="context-menu" part="Trigger" />

| Attribute         | Description                            |
| ----------------- | -------------------------------------- |
| `data-popup-open` | Present when the context menu is open. |
| `data-pressed`    | Present when the context menu is open. |

### Positioner

`ContextMenu.Positioner` takes the [Menu.Positioner](/components/menu#positioner) props and data attributes, except `positionMethod`: a context menu is always `position: fixed`. A root context menu defaults to `align="start"` against the pointer. When `side` is not set and `align` is not `center`, `sideOffset` defaults to `-5` and `alignOffset` to `2`. A root context menu always uses `arrowPadding` `0`. A submenu sits at the inline end of its trigger, as in Menu.

<ApiPart name="context-menu" part="Positioner" />

The parts below are the Menu parts of the same name. Their data attributes and examples are on the [Menu](/components/menu#api-reference) page.

### Backdrop

<ApiPart name="context-menu" part="Backdrop" />

### Portal

<ApiPart name="context-menu" part="Portal" />

### Popup

<ApiPart name="context-menu" part="Popup" />

### Arrow

<ApiPart name="context-menu" part="Arrow" />

### Group

<ApiPart name="context-menu" part="Group" />

### GroupLabel

<ApiPart name="context-menu" part="GroupLabel" />

### Item

<ApiPart name="context-menu" part="Item" />

### CheckboxItem

<ApiPart name="context-menu" part="CheckboxItem" />

### CheckboxItemIndicator

<ApiPart name="context-menu" part="CheckboxItemIndicator" />

### LinkItem

<ApiPart name="context-menu" part="LinkItem" />

### RadioGroup

<ApiPart name="context-menu" part="RadioGroup" />

### RadioItem

<ApiPart name="context-menu" part="RadioItem" />

### RadioItemIndicator

<ApiPart name="context-menu" part="RadioItemIndicator" />

### SubmenuRoot

<ApiPart name="context-menu" part="SubmenuRoot" />

### SubmenuTrigger

<ApiPart name="context-menu" part="SubmenuTrigger" />

### Separator

<ApiPart name="context-menu" part="Separator" />
