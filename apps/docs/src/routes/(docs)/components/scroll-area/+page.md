# Scroll Area

<Subtitle>
  A native scroll container with custom scrollbars.
</Subtitle>

<Meta name="description" content="A native scroll container with custom scrollbars." />

<DemoScrollAreaHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root>
	<ScrollArea.Viewport>
		<ScrollArea.Content />
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar>
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>
```

## Examples

### Both scrollbars

Use `<ScrollArea.Corner>` to prevent the scrollbars from intersecting.

<DemoScrollAreaBoth />

### Gradient scroll fade

Use the viewport overflow CSS variables to drive a CSS mask, which gradually increases the fade as the user scrolls away from the edges.

```css title="scroll-area.module.css"
.Viewport {
	mask-image: linear-gradient(
		to bottom,
		transparent 0,
		black min(40px, var(--scroll-area-overflow-y-start)),
		black calc(100% - min(40px, var(--scroll-area-overflow-y-end, 40px))),
		transparent 100%
	);
	mask-repeat: no-repeat;
}
```

For SSR, a fallback can be used as part of the end-side `var()` call so the mask is visible before the overflow CSS variables hydrate.

```css title="SSR fallback"
/* @highlight-text ", 40px" */
var(--scroll-area-overflow-y-end, 40px);
```

When the fade is applied to `<ScrollArea.Viewport>` itself, the variables can be used directly. However, inheritance to children is disabled, so they must explicitly opt-in using the `inherit` keyword.

```css title="Child element opt-in"
.Child {
	--scroll-area-overflow-y-start: inherit;
	--scroll-area-overflow-y-end: inherit;
}
```

<DemoScrollAreaScrollFade />

### Combining with Tabs

Use `<Tabs.List>`'s `render` snippet to render `<ScrollArea.Viewport>` directly when the tab list itself needs the viewport overflow values for a mask fade. This keeps the mask logic on the same element that receives the scroll state.

```svelte title="Tabs with ScrollArea"
<Tabs.Root value="overview">
	<ScrollArea.Root>
		<!-- @highlight-start -->
		<Tabs.List>
			{#snippet render(props, state, children)}
				<ScrollArea.Viewport {...props}>{@render children?.()}</ScrollArea.Viewport>
			{/snippet}
			<!-- @highlight-end -->
			<Tabs.Tab value="overview">Overview</Tabs.Tab>
			<Tabs.Indicator />
		</Tabs.List>
	</ScrollArea.Root>
	<Tabs.Panel value="overview">...</Tabs.Panel>
</Tabs.Root>
```

## API reference

<script>
	import { DemoScrollAreaHero } from './demos/hero';
	import { DemoScrollAreaBoth } from './demos/both';
	import { DemoScrollAreaScrollFade } from './demos/scroll-fade';
	import { TypesScrollArea } from './types';
</script>

### Root

<TypesScrollArea.Root />

### Viewport

<TypesScrollArea.Viewport />

### Content

<TypesScrollArea.Content />

### Scrollbar

<TypesScrollArea.Scrollbar />

### Thumb

<TypesScrollArea.Thumb />

### Corner

<TypesScrollArea.Corner />
