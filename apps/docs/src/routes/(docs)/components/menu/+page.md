# Menu

<Subtitle>
  A list of actions in a dropdown, enhanced with keyboard navigation.
</Subtitle>

<Meta name="description" content="A list of actions in a dropdown, enhanced with keyboard navigation." />

<DemoMenuHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
</script>

<Menu.FilterProvider>
	<Menu.Root>
		<Menu.Trigger />
		<Menu.Portal>
			<Menu.Backdrop />
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Arrow />
					<Menu.Input />
					<Menu.Clear />
					<Menu.Empty />

					<Menu.List>
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
					</Menu.List>

					<Menu.Viewport />
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
```

## Examples

### Open on hover

To create a menu that opens on hover, add the `openOnHover` prop to `<Menu.Trigger>`. You can additionally configure how quickly the menu opens on hover using the `delay` prop.

<DemoMenuOpenOnHover />

### Checkbox items

Use the `<Menu.CheckboxItem>` part to create a menu item that can toggle a setting on or off.

<DemoMenuCheckboxItems />

### Radio items

Use the `<Menu.RadioGroup>` and `<Menu.RadioItem>` parts to create menu items that work like radio buttons.

<DemoMenuRadioItems />

### Close on click

Use the `closeOnClick` prop to change whether the menu closes when an item is clicked.

```svelte title="Control whether the menu closes on click"
<!-- Close the menu when a checkbox item is clicked -->
<Menu.CheckboxItem closeOnClick />

<!-- Keep the menu open when an item is clicked -->
<Menu.Item closeOnClick={false} />
```

### Group labels

Use the `<Menu.GroupLabel>` part to add a label to a `<Menu.Group>` or `<Menu.RadioGroup>`.

<DemoMenuGroupLabels />

### Nested menu

To create a submenu, nest another menu inside the parent menu with `<Menu.SubmenuRoot>`. Use the `<Menu.SubmenuTrigger>` part for the menu item that opens the nested menu.

```svelte title="Adding a submenu"
<Menu.Root>
	<Menu.Trigger />
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item />

				<!-- @highlight-start -->
				<!-- Submenu -->
				<Menu.SubmenuRoot>
					<!-- @highlight -->
					<Menu.SubmenuTrigger />
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup>
								<!-- Submenu items -->
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>
				<!-- @highlight-end -->
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

<DemoMenuSubmenu />

### Navigate to another page

Use the `<Menu.LinkItem>` part to create a link.

```svelte title="A menu item that opens a link"
<Menu.LinkItem href="/projects">Go to Projects</Menu.LinkItem>
```

### Open a dialog

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onclick` handler on the menu item.

```svelte title="Connecting a dialog to a menu"
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
				<!-- @highlight-start -->
				<!-- Open the dialog when the menu item is clicked -->
				<Menu.Item onclick={() => (dialogOpen = true)}>Open dialog</Menu.Item>
				<!-- @highlight-end -->
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<!-- @highlight-start -->
<!-- Control the dialog state -->
<Dialog.Root bind:open={dialogOpen}>
	<!-- @highlight-end -->
	<Dialog.Portal>
		<Dialog.Backdrop />
		<Dialog.Popup>
			<!-- Rest of the dialog -->
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Detached triggers

A menu can be opened by a trigger that lives either inside or outside the `<Menu.Root>`.
Keep the trigger inside `<Menu.Root>` for simple, tightly coupled layouts like the hero demo at the top of this page.
When the trigger and menu content need to live in different parts of the tree (for example, in a card list that controls a menu rendered near the document root), create a `handle` with `Menu.createHandle()` and pass it to both the trigger and the root.

Note that only top-level menus can have detached triggers.
Submenus must have their triggers defined within the `SubmenuRoot` part.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Menu.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle (before one mounts, or after it unmounts) are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const demoMenu = Menu.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoMenu}" -->
<Menu.Trigger handle={demoMenu}>Actions</Menu.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoMenu}" -->
<Menu.Root handle={demoMenu}>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<Menu.Item>Edit</Menu.Item>
				<Menu.Item>Share</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
```

<DemoMenuDetachedTriggersSimple />

### Multiple triggers

One menu can be opened by several triggers.
You can either render multiple `<Menu.Trigger>` components inside the same `<Menu.Root>`, or attach several detached triggers to the same `handle`.

```svelte title="Multiple triggers within the Root part"
<Menu.Root>
	<Menu.Trigger>Row actions</Menu.Trigger>
	<Menu.Trigger>Quick actions</Menu.Trigger>
	<!-- Rest of the menu -->
</Menu.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const projectMenu = Menu.createHandle();
</script>

<Menu.Trigger handle={projectMenu}>Row actions</Menu.Trigger>
<Menu.Trigger handle={projectMenu}>Quick actions</Menu.Trigger>

<Menu.Root handle={projectMenu}>
	<!-- Rest of the menu -->
</Menu.Root>
```

Menus can render different content depending on which trigger opened them.
Pass a `payload` prop to each `<Menu.Trigger>` and read it via the `children` snippet on `<Menu.Root>`.
Provide a type argument to `createHandle()` to strongly type the payload.

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const menus = {
		file: ['New', 'Open', 'Save'],
		edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste']
	};

	// @highlight
	const demoMenu = Menu.createHandle<{ items: string[] }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Menu.Trigger handle={demoMenu} payload={{ items: menus.file }}>File</Menu.Trigger>
<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Menu.Trigger handle={demoMenu} payload={{ items: menus.edit }}>Edit</Menu.Trigger>

<Menu.Root handle={demoMenu}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Viewport>
						{#each payload?.items ?? [] as item (item)}
							<!-- @highlight-text "payload" -->
							<Menu.Item>{item}</Menu.Item>
						{/each}
					</Menu.Viewport>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	{/snippet}
</Menu.Root>
```

### Controlled mode with multiple triggers

Control a menu's open state externally with `bind:open` on `<Menu.Root>`.
When more than one trigger can open the menu, track the active trigger with `bind:triggerId` on `<Menu.Root>` and matching `id` props on each `<Menu.Trigger>`.
The `onOpenChange` callback receives `eventDetails`, which includes the DOM element that initiated the change as `trigger`, so you can react when the user activates a different trigger.

<DemoMenuDetachedTriggersControlled />

### Arrow

Use the `<Menu.Arrow>` part inside the popup to visually connect the menu to its trigger.

<DemoMenuArrow />

### Animating the Menu

When one menu is opened by multiple detached triggers, you can animate the menu as it moves between triggers.
This includes animating position, size, and content.

#### Position and Size

To animate the menu's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The menu also supports content transitions.
This is useful when different triggers display different content within the same menu.

To enable content animations, wrap the menu content in the `<Menu.Viewport>` part.
This part renders a `div` with `data-activation-direction`, containing up to two space-separated tokens (a horizontal `left` or `right` value and a vertical `up` or `down` value), so you can make direction-aware animations.

Inside `<Menu.Viewport>`, content is wrapped in `div`s with transition data attributes:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

<DemoMenuDetachedTriggersFull />

### Filtering

Wrap `<Menu.Root>` in `<Menu.FilterProvider>`, add `<Menu.Input>` to the popup, and put the items inside `<Menu.List>`.

```svelte title="Filterable menu"
<Menu.FilterProvider>
	<Menu.Root>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Input aria-label="Filter actions" />
					<Menu.Clear>Clear</Menu.Clear>
					<Menu.Empty>No results.</Menu.Empty>
					<Menu.List>
						<Menu.Item>Rename</Menu.Item>
						<Menu.Item>Delete</Menu.Item>
					</Menu.List>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
```

Label the input with `aria-label`, `aria-labelledby`, or a visible `<label>`.
Type to narrow the actions, then use the arrow keys to move through matching items.

<DemoMenuFilter />

#### Matching items

Items match their text by default. Use `label` to override it.

```svelte title="Labels"
<Menu.Item label="Move to folder">Move</Menu.Item>
```

Groups with no matching items get the `hidden` attribute and stay mounted. If your styles set `display` on a group, add a `[hidden]` rule so it still hides.

```css title="Hiding styled groups"
.Group {
	display: flex;
}

.Group[hidden] {
	display: none;
}
```

`<Menu.Empty>` appears when no items match.

By default, an item matches when its text contains the query, ignoring case, accents, and punctuation.
Use `filter` to replace the matching. It receives each item's text and the trimmed query, and keeps the item when it returns `true`.
`Menu.useFilter` provides the same locale-aware comparisons.

```svelte title="Custom matching"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const { startsWith } = Menu.useFilter();
</script>

<Menu.FilterProvider filter={startsWith}>
	<Menu.Root><!-- menu parts --></Menu.Root>
</Menu.FilterProvider>
```

For external filtering, pass `filter={null}` and render the results yourself, omitting empty groups.

```svelte title="External filtering"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const { contains } = Menu.useFilter();
	let query = $state('');
	const results = $derived(actions.filter((action) => contains(action.label, query)));
</script>

<Menu.FilterProvider filter={null} bind:value={query}>
	<Menu.Root><!-- render `results` --></Menu.Root>
</Menu.FilterProvider>
```

#### Controlling the query

`bind:value` on `<Menu.FilterProvider>` controls the query, and `onValueChange` reports each change.
It resets to an empty string when the menu closes, reported with the `'popup-close'` reason. Cancel that change to keep the query.

#### Highlighting

Use `autoHighlight` to highlight the first match while filtering, or `autoHighlight="always"` to highlight it even when the query is empty.
The highlighted item has the `data-highlighted` attribute, and `onItemHighlighted` on `<Menu.Root>` reports each change.

#### Focus and keyboard

Opening the menu with a click or the keyboard focuses the input. Opening it on hover, touch, or with a pen does not, so the on-screen keyboard stays hidden.
The arrow keys move the highlight while the input keeps focus. <kbd>Tab</kbd> closes the menu, and <kbd>Shift</kbd>+<kbd>Tab</kbd> returns focus to the trigger.
The popup is a `dialog` that holds the `searchbox` input and the `menu` list.

#### Submenus

Wrap each searchable `<Menu.SubmenuRoot>` in its own `<Menu.FilterProvider>`.
Submenus without a provider remain unfiltered.

#### Filtering with detached triggers

Use the same `Menu.createHandle()` handle for the root and its detached trigger:

```svelte title="Detached trigger"
<script lang="ts">
	import { Menu } from '@sveltery/base/menu';

	const handle = Menu.createHandle();
</script>

<Menu.Trigger {handle}>Actions</Menu.Trigger>
<Menu.FilterProvider>
	<Menu.Root {handle}><!-- menu parts --></Menu.Root>
</Menu.FilterProvider>
```

## API reference

<script>
	import { DemoMenuHero } from './demos/hero';
	import { DemoMenuOpenOnHover } from './demos/open-on-hover';
	import { DemoMenuCheckboxItems } from './demos/checkbox-items';
	import { DemoMenuRadioItems } from './demos/radio-items';
	import { DemoMenuGroupLabels } from './demos/group-labels';
	import { DemoMenuSubmenu } from './demos/submenu';
	import { DemoMenuDetachedTriggersSimple } from './demos/detached-triggers-simple';
	import { DemoMenuDetachedTriggersControlled } from './demos/detached-triggers-controlled';
	import { DemoMenuArrow } from './demos/arrow';
	import { DemoMenuDetachedTriggersFull } from './demos/detached-triggers-full';
	import { DemoMenuFilter } from './demos/filter';
	import { TypesMenu } from './types';
</script>

### FilterProvider

<TypesMenu.FilterProvider />

### Root

<TypesMenu.Root />

### Trigger

<TypesMenu.Trigger />

### Portal

<TypesMenu.Portal />

### Backdrop

<TypesMenu.Backdrop />

### Positioner

<TypesMenu.Positioner />

### Popup

<TypesMenu.Popup />

### Viewport

<TypesMenu.Viewport />

The `Viewport` is optional. Reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

### Arrow

<TypesMenu.Arrow />

### Input

<TypesMenu.Input />

### Clear

<TypesMenu.Clear />

### Empty

<TypesMenu.Empty />

### List

<TypesMenu.List />

### Item

<TypesMenu.Item />

### LinkItem

<TypesMenu.LinkItem />

### SubmenuRoot

<TypesMenu.SubmenuRoot />

### SubmenuTrigger

<TypesMenu.SubmenuTrigger />

### Group

<TypesMenu.Group />

### GroupLabel

<TypesMenu.GroupLabel />

### RadioGroup

<TypesMenu.RadioGroup />

### RadioItem

<TypesMenu.RadioItem />

### RadioItemIndicator

<TypesMenu.RadioItemIndicator />

### CheckboxItem

<TypesMenu.CheckboxItem />

### CheckboxItemIndicator

<TypesMenu.CheckboxItemIndicator />

### Separator

<TypesMenu.Separator />

## useFilter

When filtering items yourself, `Menu.useFilter` matches text according to the user's locale.

**Parameters**

`GetFilterParameters`

| Prop     | Type                   | Description                                                                                                                  |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `locale` | `Intl.LocalesArgument` | The locale to use for string comparison. Defaults to the user's runtime locale. Any `Intl.CollatorOptions` are accepted too. |

**Return value**

`Filter`

| Property     | Type                                                                                  | Description                                          |
| ------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `contains`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item matches the query anywhere. |
| `startsWith` | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item starts with the query.      |
| `endsWith`   | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Returns whether the item ends with the query.        |

## createHandle

Creates a new handle to connect a `Menu.Root` with detached `Menu.Trigger` components.

**Return value**

`Menu.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a Menu imperatively and associates detached `Menu.Trigger` components with a `Menu.Root`.
Create one with `Menu.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted. Calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                  |
| --------- | ---------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the menu is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that owns the menu.                                               |

**Methods**

| Method    | Parameters          | Returns | Description                                                                                                                                                     |
| --------- | ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | `triggerId: string` | `void`  | Opens the menu and associates it with the trigger with the given id. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                     | `void`  | Closes the menu. This method should only be called in an event handler or an effect (not during rendering).                                                     |
| `unmount` |                     | `void`  | Ends the closing phase of the menu after an externally controlled closing animation finishes.                                                                   |
