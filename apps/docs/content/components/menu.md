---
title: Menu
description: A list of actions in a dropdown, with keyboard navigation.
---

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const item =
		'flex cursor-default items-center py-2 pr-8 pl-4 text-sm leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900 dark:data-[highlighted]:text-gray-900 dark:data-[highlighted]:before:bg-gray-100';
</script>

<Menu.Root>
	<Menu.Trigger
		class="flex h-10 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800"
	>
		Song
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner sideOffset={8}>
			<Menu.Popup
				class="origin-[var(--transform-origin)] rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[instant]:transition-none dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Menu.Item class={item}>Add to Library</Menu.Item>
				<Menu.Item class={item}>Add to Playlist</Menu.Item>
				<Menu.Separator class="mx-4 my-1.5 h-px bg-gray-200 dark:bg-gray-700" />
				<Menu.Item class={item}>Play Next</Menu.Item>
				<Menu.Item class={item}>Play Last</Menu.Item>
				<Menu.Separator class="mx-4 my-1.5 h-px bg-gray-200 dark:bg-gray-700" />
				<Menu.Item class={item}>Favorite</Menu.Item>
				<Menu.Item class={item}>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
</script>

<Menu.Root>
	<Menu.Trigger />
	<Menu.Portal>
		<Menu.Backdrop />
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Arrow />
				<Menu.Item />
				<Menu.LinkItem />
				<Menu.Separator />

				<Menu.SubmenuRoot>
					<Menu.SubmenuTrigger />
				</Menu.SubmenuRoot>

				<Menu.Group>
					<Menu.GroupLabel />
				</Menu.Group>

				<Menu.RadioGroup>
					<Menu.GroupLabel />
					<Menu.RadioItem>
						<Menu.RadioItemIndicator />
					</Menu.RadioItem>
				</Menu.RadioGroup>

				<Menu.CheckboxItem>
					<Menu.CheckboxItemIndicator />
				</Menu.CheckboxItem>

				<Menu.Viewport />
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

`Menu.Backdrop`, `Menu.Arrow` and `Menu.Viewport` are optional. `Menu.Positioner` and `Menu.Popup` are required.

## Examples

### Open state

Bind `open` to read and change whether the menu is open. Without `bind:`, the menu manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let open = $state(false);
	let reason = $state('none yet');

	const item =
		'flex cursor-default py-2 pr-8 pl-4 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Open: {open}. Last change reason: {reason}</p>
	<Menu.Root bind:open onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}>
		<Menu.Trigger
			class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			Actions
		</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner sideOffset={8}>
				<Menu.Popup
					class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Menu.Item class={item}>Rename</Menu.Item>
					<Menu.Item class={item}>Duplicate</Menu.Item>
					<Menu.Item class={item}>Delete</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</div>
```

The `reason` in the event details is one of `trigger-press`, `trigger-hover`, `trigger-focus`, `outside-press`, `item-press`, `escape-key`, `list-navigation`, `focus-out`, `close-press`, `sibling-open`, `cancel-open`, `imperative-action`, or `none`.

### Open on hover

Set `openOnHover` on the trigger to open the menu when the pointer rests on it. `delay` is the wait before it opens and defaults to 100 milliseconds. `closeDelay` is the wait before it closes and defaults to 0. A menu opened by hover is not modal.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const item =
		'flex cursor-default py-2 pr-8 pl-4 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<Menu.Root>
	<Menu.Trigger
		openOnHover
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Hover me
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner sideOffset={8}>
			<Menu.Popup
				class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Menu.Item class={item}>Profile</Menu.Item>
				<Menu.Item class={item}>Settings</Menu.Item>
				<Menu.Item class={item}>Sign out</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Checkbox items

`Menu.CheckboxItem` turns a setting on or off. Bind `checked` to read the value. `Menu.CheckboxItemIndicator` renders only while the item is checked, unless you set `keepMounted`. A checkbox item keeps the menu open when clicked.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let minimap = $state(true);
	let breadcrumbs = $state(false);

	const item =
		'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-8 pl-2.5 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<Menu.Root>
	<Menu.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		View
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner sideOffset={8}>
			<Menu.Popup
				class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Menu.CheckboxItem bind:checked={minimap} class={item}>
					<Menu.CheckboxItemIndicator class="col-start-1">✓</Menu.CheckboxItemIndicator>
					<span class="col-start-2">Minimap</span>
				</Menu.CheckboxItem>
				<Menu.CheckboxItem bind:checked={breadcrumbs} class={item}>
					<Menu.CheckboxItemIndicator class="col-start-1">✓</Menu.CheckboxItemIndicator>
					<span class="col-start-2">Breadcrumbs</span>
				</Menu.CheckboxItem>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Radio items

Put `Menu.RadioItem` parts in a `Menu.RadioGroup` to pick one value. Bind `value` on the group. `Menu.GroupLabel` names the group.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let sort = $state('date');

	const item =
		'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-8 pl-2.5 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<Menu.Root>
	<Menu.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Sort by {sort}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner sideOffset={8}>
			<Menu.Popup
				class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Menu.RadioGroup bind:value={sort}>
					<Menu.GroupLabel
						class="py-2 pr-8 pl-7.5 text-sm text-gray-600 select-none dark:text-gray-400"
					>
						Sort
					</Menu.GroupLabel>
					{#each ['date', 'name', 'type'] as value (value)}
						<Menu.RadioItem {value} class={item}>
							<Menu.RadioItemIndicator class="col-start-1">•</Menu.RadioItemIndicator>
							<span class="col-start-2 capitalize">{value}</span>
						</Menu.RadioItem>
					{/each}
				</Menu.RadioGroup>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Close on click

`closeOnClick` decides whether clicking an item closes the menu. It defaults to `true` for `Menu.Item` and `false` for checkbox, radio and link items.

```svelte
<Menu.CheckboxItem closeOnClick>Close after toggling</Menu.CheckboxItem>
<Menu.Item closeOnClick={false}>Keep the menu open</Menu.Item>
```

### Nested menu

Nest a `Menu.SubmenuRoot` in a popup to add a submenu. `Menu.SubmenuTrigger` is the item that opens it. The submenu opens on hover, on click, and with the arrow key that points toward it. Set `openOnHover={false}` on the submenu trigger to open it only by click or keyboard.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const item =
		'flex cursor-default items-center justify-between gap-4 py-2 pr-4 pl-4 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 data-[popup-open]:bg-gray-100 data-[highlighted]:data-[popup-open]:bg-gray-900 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900 dark:data-[popup-open]:bg-gray-800';
	const popup =
		'rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700';
</script>

<Menu.Root>
	<Menu.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Song
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner sideOffset={8}>
			<Menu.Popup class={popup}>
				<Menu.Item class={item}>Add to Library</Menu.Item>
				<Menu.SubmenuRoot>
					<Menu.SubmenuTrigger class={item}>
						Add to Playlist <span aria-hidden="true">›</span>
					</Menu.SubmenuTrigger>
					<Menu.Portal>
						<Menu.Positioner alignOffset={-4}>
							<Menu.Popup class={popup}>
								<Menu.Item class={item}>Get Up!</Menu.Item>
								<Menu.Item class={item}>Inside Out</Menu.Item>
								<Menu.Item class={item}>Night Beats</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>
				<Menu.Item class={item}>Play Next</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

### Navigate to another page

`Menu.LinkItem` renders an `<a>` element. It does not close the menu on click unless you set `closeOnClick`.

```svelte
<Menu.LinkItem href="/projects">Go to Projects</Menu.LinkItem>
```

### Open a dialog

Bind the dialog's `open` and set it from the item's `onclick`. The menu closes and the dialog takes focus.

```svelte
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { Menu } from '@sveltery/base/menu';

	let dialogOpen = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger>Open menu</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item onclick={() => (dialogOpen = true)}>Open dialog</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Portal>
		<Dialog.Backdrop />
		<Dialog.Popup>…</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Detached triggers

A trigger does not have to sit inside `Menu.Root`. Create a handle with `Menu.createHandle()` and pass it to the root and to each trigger as `handle`. Only a top-level menu can have detached triggers. A submenu's trigger stays inside its `Menu.SubmenuRoot`.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const handle = Menu.createHandle();

	const item =
		'flex cursor-default py-2 pr-8 pl-4 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Menu.Trigger
		{handle}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
	>
		Actions
	</Menu.Trigger>

	<Menu.Root {handle}>
		<Menu.Portal>
			<Menu.Positioner sideOffset={8}>
				<Menu.Popup
					class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Menu.Item class={item}>Edit</Menu.Item>
					<Menu.Item class={item}>Share</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</div>
```

A handle also controls the menu from code. Call `handle.open(triggerId)`, `handle.close()`, or `handle.unmount()`, and read `handle.isOpen` and `handle.payload`. These calls need a mounted `Menu.Root` that uses the handle. A call made while no root is mounted is ignored with a warning, and a root that mounts later starts closed. `handle.open(triggerId)` throws when no trigger with that id is registered, because the menu needs a trigger to anchor to.

### Multiple triggers

Several triggers can open the same menu, inside one `Menu.Root` or through one handle. Give each trigger a `payload`. The snippet you pass as the children of `Menu.Root` receives it as `{ payload }`, and `handle.payload` holds it too. Type the payload with `Menu.createHandle<T>()`.

```svelte
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const handle = Menu.createHandle<{ items: string[] }>();
</script>

<Menu.Trigger {handle} payload={{ items: ['New', 'Open', 'Save'] }}>File</Menu.Trigger>
<Menu.Trigger {handle} payload={{ items: ['Undo', 'Redo', 'Cut'] }}>Edit</Menu.Trigger>

<Menu.Root {handle}>
	{#snippet children({ payload })}
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					{#each payload?.items ?? [] as label (label)}
						<Menu.Item>{label}</Menu.Item>
					{/each}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	{/snippet}
</Menu.Root>
```

### Controlled mode with multiple triggers

Bind `triggerId` next to `open` to know which trigger owns the menu. Give each trigger an `id`. Setting `triggerId` while the menu is open moves it to that trigger. The `eventDetails.trigger` property of `onOpenChange` is the trigger element that caused the change.

```svelte demo
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
	const item =
		'flex cursor-default py-2 pr-8 pl-4 text-sm outline-none select-none data-[highlighted]:bg-gray-900 data-[highlighted]:text-gray-50 dark:data-[highlighted]:bg-gray-100 dark:data-[highlighted]:text-gray-900';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Open: {open}. Trigger: {triggerId ?? 'none'}.</p>
	<Menu.Root bind:open bind:triggerId>
		<div class="flex gap-3">
			<Menu.Trigger id="trigger-a" class={button}>Trigger A</Menu.Trigger>
			<Menu.Trigger id="trigger-b" class={button}>Trigger B</Menu.Trigger>
		</div>
		<Menu.Portal>
			<Menu.Positioner sideOffset={8}>
				<Menu.Popup
					class="rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Menu.Item class={item}>Opened by {triggerId}</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</div>
```

### Highlighted item

`onItemHighlighted` on `Menu.Root` reports each change of the highlighted item. It receives the item element, or `undefined` when nothing is highlighted, and details with a `reason` of `keyboard`, `pointer`, or `none`, the `event`, and the item's `label`. The label is the item's `label` prop, or its text when the prop is not set.

```svelte
<Menu.Root onItemHighlighted={(item, details) => console.log(details.label, details.reason)}>
	…
</Menu.Root>
```

Set `highlightItemOnHover={false}` to highlight items only from the keyboard, so `:hover` and `[data-highlighted]` can be styled apart.

### Arrow

Render `Menu.Arrow` inside `Menu.Popup` to point at the trigger. It sets `data-side` to the side of the trigger the menu is on, so use it to rotate and offset your arrow graphic.

```svelte
<Menu.Arrow
	class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.5 data-[side=left]:rotate-90 data-[side=right]:-left-3.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
>
	<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
		<path d="M0 10L10 1L20 10" />
	</svg>
</Menu.Arrow>
```

### Animate the menu

With several triggers, the positioner moves from one trigger to the next. Transition the positioner's `top`, `left`, `right`, and `bottom` to animate that move, and the popup's `width` and `height` to animate the size change. Wrap the content in `Menu.Viewport` to cross-fade it. While the viewport animates, it renders the previous content in an element with `data-previous` and the new content in an element with `data-current`, and sets `data-activation-direction` to where the new trigger sits relative to the old one.

`data-instant` on the popup and positioner names a change that should not animate: `click` for a keyboard open, `dismiss` for an Escape close, `group` inside a menubar, and `trigger-change` after a move between triggers. Add `data-[instant]:transition-none` to honor it.

## Differences from Base UI

- `open` and `triggerId` are bindable props on `Menu.Root`, and `open` on `Menu.SubmenuRoot`. Use `bind:open` and `bind:triggerId` instead of `open`, `defaultOpen`, `triggerId`, and `defaultTriggerId` together. Pass them without `bind:` to set the initial state. `checked` on `Menu.CheckboxItem` and `value` on `Menu.RadioGroup` are bindable the same way.
- `onOpenChange` runs before the state changes. Call `eventDetails.cancel()` to keep the menu as it is. Setting `open` yourself does not call it.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Menu.Root` and `Menu.SubmenuRoot` render no element, so they have no `render`.
- The `Menu.Root` children snippet receives `{ payload }`, where React passes a render function.
- `actionsRef` is not available. Use `bind:this` on `Menu.Root` or `Menu.SubmenuRoot`, which exposes `close()` and `unmount()`.
- Handlers use lowercase names, such as `onclick`.
- Item labels for typeahead and `onItemHighlighted` are trimmed.
- The filter parts (`Menu.FilterProvider`, `Menu.Input`, `Menu.Clear`, `Menu.Empty`, `Menu.List` and `Menu.useFilter`) are not available yet. Context menu parents are typed but have no public component yet. Place menus in a [Menubar](/components/menubar) to build an application menu bar. Refs are not supported.

## API reference

### Root

<ApiPart name="menu" part="Root" />

`Menu.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="menu" part="Trigger" />

| Attribute         | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `data-popup-open` | Present when the menu is open and this trigger opened it.              |
| `data-pressed`    | Present when the menu is open and was opened by pressing this trigger. |
| `data-disabled`   | Present when the trigger is disabled.                                  |

### Portal

<ApiPart name="menu" part="Portal" />

### Backdrop

<ApiPart name="menu" part="Backdrop" />

| Attribute             | Description                             |
| --------------------- | --------------------------------------- |
| `data-open`           | Present when the menu is open.          |
| `data-closed`         | Present when the menu is closed.        |
| `data-starting-style` | Present when the menu is animating in.  |
| `data-ending-style`   | Present when the menu is animating out. |

### Positioner

<ApiPart name="menu" part="Positioner" />

A top-level menu sits below its trigger, centered. A submenu sits at the inline end of its trigger, aligned to the start. `sideOffset` and `alignOffset` default to `0`, `collisionPadding` and `arrowPadding` to `5`. `anchor` defaults to the trigger that opened the menu.

| Attribute            | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| `data-open`          | Present when the menu is open.                                                      |
| `data-closed`        | Present when the menu is closed.                                                    |
| `data-anchor-hidden` | Present when the trigger is hidden or clipped, so the menu has nothing to point at. |
| `data-side`          | The side of the trigger the menu is on after collisions.                            |
| `data-align`         | How the menu lines up with the trigger after collisions.                            |
| `data-nested`        | Present on a submenu.                                                               |
| `data-instant`       | The change that should not animate, such as `click` or `trigger-change`.            |

| CSS variable          | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `--anchor-width`      | The width of the trigger.                                                   |
| `--anchor-height`     | The height of the trigger.                                                  |
| `--available-width`   | The width between the trigger and the edge of the boundary.                 |
| `--available-height`  | The height between the trigger and the edge of the boundary.                |
| `--positioner-width`  | The width of the positioner.                                                |
| `--positioner-height` | The height of the positioner.                                               |
| `--transform-origin`  | The point on the menu that the trigger is closest to, for scale animations. |

### Popup

<ApiPart name="menu" part="Popup" />

| Attribute             | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `data-open`           | Present when the menu is open.                                           |
| `data-closed`         | Present when the menu is closed.                                         |
| `data-side`           | The side of the trigger the menu is on after collisions.                 |
| `data-align`          | How the menu lines up with the trigger after collisions.                 |
| `data-nested`         | Present on a submenu.                                                    |
| `data-instant`        | The change that should not animate, such as `click` or `trigger-change`. |
| `data-starting-style` | Present when the menu is animating in.                                   |
| `data-ending-style`   | Present when the menu is animating out.                                  |

### Arrow

<ApiPart name="menu" part="Arrow" />

| Attribute         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `data-open`       | Present when the menu is open.                                    |
| `data-closed`     | Present when the menu is closed.                                  |
| `data-side`       | The side of the trigger the menu is on after collisions.          |
| `data-align`      | How the menu lines up with the trigger after collisions.          |
| `data-uncentered` | Present when the arrow cannot point at the center of the trigger. |

### Viewport

<ApiPart name="menu" part="Viewport" />

| Attribute                   | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `data-activation-direction` | Where the new trigger sits relative to the previous one, such as `left` or `right down`. |
| `data-transitioning`        | Present while the previous content is on screen.                                         |
| `data-instant`              | The change that should not animate.                                                      |

### Item

<ApiPart name="menu" part="Item" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### LinkItem

<ApiPart name="menu" part="LinkItem" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-highlighted` | Present when the link is highlighted. |

### SubmenuRoot

<ApiPart name="menu" part="SubmenuRoot" />

### SubmenuTrigger

<ApiPart name="menu" part="SubmenuTrigger" />

| Attribute          | Description                              |
| ------------------ | ---------------------------------------- |
| `data-popup-open`  | Present when the submenu is open.        |
| `data-highlighted` | Present when the trigger is highlighted. |
| `data-disabled`    | Present when the trigger is disabled.    |

### Group

<ApiPart name="menu" part="Group" />

### GroupLabel

<ApiPart name="menu" part="GroupLabel" />

### RadioGroup

<ApiPart name="menu" part="RadioGroup" />

### RadioItem

<ApiPart name="menu" part="RadioItem" />

| Attribute          | Description                            |
| ------------------ | -------------------------------------- |
| `data-checked`     | Present when the item is selected.     |
| `data-unchecked`   | Present when the item is not selected. |
| `data-highlighted` | Present when the item is highlighted.  |
| `data-disabled`    | Present when the item is disabled.     |

### RadioItemIndicator

<ApiPart name="menu" part="RadioItemIndicator" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-checked`        | Present when the item is selected.           |
| `data-unchecked`      | Present when the item is not selected.       |
| `data-disabled`       | Present when the item is disabled.           |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |

### CheckboxItem

<ApiPart name="menu" part="CheckboxItem" />

| Attribute          | Description                           |
| ------------------ | ------------------------------------- |
| `data-checked`     | Present when the item is checked.     |
| `data-unchecked`   | Present when the item is not checked. |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### CheckboxItemIndicator

<ApiPart name="menu" part="CheckboxItemIndicator" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-checked`        | Present when the item is checked.            |
| `data-unchecked`      | Present when the item is not checked.        |
| `data-disabled`       | Present when the item is disabled.           |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |

### Separator

<ApiPart name="menu" part="Separator" />

| Attribute          | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `data-orientation` | The orientation of the separator, `horizontal` or `vertical`. |
