# Context Menu

<Subtitle>
  A menu that appears at the pointer on right click or long press.
</Subtitle>

<Meta name="description" content="A menu that appears at the pointer on right click or long press." />

<DemoContextMenuHero />

## Usage guidelines

- **Use context menus as an enhancement**: Don't make a context menu the only way to perform actions. Users may not discover or be able to open a context menu, especially on touch devices or with assistive technology. Always provide visible controls for the actions that are available in the context menu.

## Anatomy

Import the components and place them together:

```svelte title="Anatomy"
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

## Examples

[Menu](/components/menu#examples) displays additional demos, many of which apply to the context menu as well.

### Using with Menu

A context menu should supplement a primary way to perform the same actions. This image card exposes actions through a visible menu button and reuses them in the context menu for right-click and long-press users.

<DemoContextMenuWithMenu />

### Nested menu

To create a submenu, create a `<ContextMenu.SubmenuRoot>` inside the parent context menu. Use the `<ContextMenu.SubmenuTrigger>` part for the menu item that opens the nested menu.

<DemoContextMenuSubmenu />

## API reference

<script>
	import { DemoContextMenuHero } from './demos/hero';
	import { DemoContextMenuWithMenu } from './demos/with-menu';
	import { DemoContextMenuSubmenu } from './demos/submenu';
	import { TypesContextMenu } from './types';
</script>

### Root

<TypesContextMenu.Root />

### Trigger

<TypesContextMenu.Trigger />

### Portal

<TypesContextMenu.Portal />

### Backdrop

<TypesContextMenu.Backdrop />

### Positioner

<TypesContextMenu.Positioner />

### Popup

<TypesContextMenu.Popup />

### Arrow

<TypesContextMenu.Arrow />

### Item

<TypesContextMenu.Item />

### LinkItem

<TypesContextMenu.LinkItem />

### SubmenuRoot

<TypesContextMenu.SubmenuRoot />

### SubmenuTrigger

<TypesContextMenu.SubmenuTrigger />

### Group

<TypesContextMenu.Group />

### GroupLabel

<TypesContextMenu.GroupLabel />

### RadioGroup

<TypesContextMenu.RadioGroup />

### RadioItem

<TypesContextMenu.RadioItem />

### RadioItemIndicator

<TypesContextMenu.RadioItemIndicator />

### CheckboxItem

<TypesContextMenu.CheckboxItem />

### CheckboxItemIndicator

<TypesContextMenu.CheckboxItemIndicator />

### Separator

<TypesContextMenu.Separator />
