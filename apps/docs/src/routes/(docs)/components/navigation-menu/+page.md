# Navigation Menu

<Subtitle>
  A collection of links and menus for website navigation.
</Subtitle>

<Meta name="description" content="A collection of links and menus for website navigation." />

<DemoNavigationMenuHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>
				<NavigationMenu.Icon />
			</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link />
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Backdrop />
		<NavigationMenu.Positioner>
			<NavigationMenu.Popup>
				<NavigationMenu.Arrow />
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

## Examples

### Nested submenus

`<NavigationMenu.Root>` component can be nested within a higher-level `<NavigationMenu.Content>` part to create a multi-level navigation menu.

<DemoNavigationMenuNested />

### Nested inline submenus

For second-level navigation that should stay in the same panel, omit the nested `<NavigationMenu.Portal>` and render only `List` + `Viewport` with an initial `value`.

<DemoNavigationMenuNestedInline />

### Custom links

The `<NavigationMenu.Link>` part can be customized to render the link from your framework using the `render` prop to enable client-side routing.

```svelte title="Custom link component example"
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
	// @highlight
	import MyLink from './MyLink.svelte';
</script>

<NavigationMenu.Link href="/docs">
	<!-- @highlight-start -->
	{#snippet render(props, state, children)}
		<MyLink {...props}>{@render children?.()}</MyLink>
	{/snippet}
	<!-- @highlight-end -->
</NavigationMenu.Link>
```

### Large menus

When you have large menu content that doesn't fit in the viewport in some cases, you usually have two choices:

1. Compress the navigation menu content

You can change the layout of the navigation menu to render less content or be more compact by reducing the space it takes up.
If your content is flexible, you can use the `max-height` property on `.Popup` to limit the height of the navigation menu to let it compress itself while preventing overflow.

```css title="Compact layout"
.Content,
.Popup {
	max-height: var(--available-height);
}
```

2. Make the navigation menu scrollable

```css title="Scrollable layout"
.Content,
.Popup {
	max-height: var(--available-height);
}

.Content {
	overflow-y: auto;
}
```

Native scrollbars are visible while transitioning content, so we recommend using the [Scroll Area](/components/scroll-area) component instead of native scrollbars to keep them hidden, which also allows the `Arrow` to be centered correctly.

## Closing animations

The popup stays rendered until its closing animation finishes.
See [JavaScript animations](/handbook/animation#javascript-animations) for animating it with Svelte transitions and for manual control.
For Navigation Menu, call `eventDetails.preventUnmountOnClose()` in `onValueChange` when the value becomes `null`, and call `close()` on the root (bound with `bind:this`) instead of setting `value` to `null` directly.

## API reference

<script>
	import { DemoNavigationMenuHero } from './demos/hero';
	import { DemoNavigationMenuNested } from './demos/nested';
	import { DemoNavigationMenuNestedInline } from './demos/nested-inline';
	import { TypesNavigationMenu } from './types';
</script>

### Root

<TypesNavigationMenu.Root />

### List

<TypesNavigationMenu.List />

### Item

<TypesNavigationMenu.Item />

### Trigger

<TypesNavigationMenu.Trigger />

### Icon

<TypesNavigationMenu.Icon />

### Content

<TypesNavigationMenu.Content />

### Link

<TypesNavigationMenu.Link />

### Backdrop

<TypesNavigationMenu.Backdrop />

### Portal

<TypesNavigationMenu.Portal />

### Positioner

<TypesNavigationMenu.Positioner />

### Popup

<TypesNavigationMenu.Popup />

### Viewport

<TypesNavigationMenu.Viewport />

### Arrow

<TypesNavigationMenu.Arrow />
