# Resizable

<Subtitle>
  Panels that the user resizes by dragging the separators between them or with the keyboard.
</Subtitle>

<Meta name="description" content="Panels that the user resizes by dragging the separators between them or with the keyboard." />

<DemoResizableHero />

Resizable ports [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) 4.5.8. Its layout engine is copied from upstream, and the parts are Svelte rewrites of its React components.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Resizable } from '@sveltery/base/resizable';
</script>

<Resizable.Group>
	<Resizable.Panel />
	<Resizable.Separator />
	<Resizable.Panel />
</Resizable.Group>
```

Panels and separators must be direct children of their group's element.

## Examples

### Sizes

`defaultSize`, `minSize`, `maxSize` and `collapsedSize` take a number of pixels or a string with a unit: `%`, `px`, `em`, `rem`, `vh` or `vw`. A string without a unit is a percentage.

```svelte title="Sizes"
<Resizable.Group orientation="vertical">
	<Resizable.Panel defaultSize="240px" minSize="10rem">Header</Resizable.Panel>
	<Resizable.Separator />
	<Resizable.Panel minSize="25%">Body</Resizable.Panel>
</Resizable.Group>
```

### Collapsible panels and methods

A `collapsible` panel collapses when it is resized below its `minSize`, and <kbd>Enter</kbd> on the separator toggles it. `bind:this` on a panel gives `collapse()`, `expand()`, `getSize()`, `isCollapsed()` and `resize()`. `bind:this` on a group gives `getLayout()` and `setLayout()`.

```svelte title="Panel methods"
<script lang="ts">
	import { Resizable } from '@sveltery/base/resizable';

	let sidebar = $state<ReturnType<typeof Resizable.Panel>>();
</script>

<button onclick={() => (sidebar?.isCollapsed() ? sidebar.expand() : sidebar?.collapse())}>
	Toggle sidebar
</button>

<Resizable.Group>
	<Resizable.Panel bind:this={sidebar} collapsible minSize="15%">Sidebar</Resizable.Panel>
	<Resizable.Separator />
	<Resizable.Panel>Content</Resizable.Panel>
</Resizable.Group>
```

### Saving the layout

`useDefaultLayout` reads a saved layout from `localStorage`, or any storage with `getItem` and `setItem`, and returns callbacks that save the layout when it settles. Call it while the component initializes. Give each panel an `id`, so the saved sizes match their panels.

```svelte title="Persistence"
<script lang="ts">
	import { Resizable, useDefaultLayout } from '@sveltery/base/resizable';

	const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: 'editor' });
</script>

<Resizable.Group {defaultLayout} {onLayoutChanged}>
	<Resizable.Panel id="files">Files</Resizable.Panel>
	<Resizable.Separator />
	<Resizable.Panel id="editor">Editor</Resizable.Panel>
</Resizable.Group>
```

### Reading an element

Put an attachment on a part to reach its element. The group, the separator and the outer element of a panel take it.

```svelte title="Attachment"
<Resizable.Group {@attach (element) => console.log(element.clientWidth)}>
	<Resizable.Panel>One</Resizable.Panel>
	<Resizable.Separator />
	<Resizable.Panel>Two</Resizable.Panel>
</Resizable.Group>
```

## Keyboard

A focused separator resizes the panel before it. The arrow keys along the group's orientation move it by 5%. <kbd>Home</kbd> and <kbd>End</kbd> move it to its limits, and <kbd>Enter</kbd> collapses or expands a collapsible panel.

## API reference

<script>
	import { DemoResizableHero } from './demos/hero';
	import { TypesResizable } from './types';
</script>

### Group

<TypesResizable.Group />

### Panel

<TypesResizable.Panel />

### Separator

<TypesResizable.Separator />
