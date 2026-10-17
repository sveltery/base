# Tabs

<Subtitle>
  A component for toggling between related panels on the same page.
</Subtitle>

<Meta name="description" content="A component for toggling between related panels on the same page." />

<DemoTabsHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';
</script>

<Tabs.Root>
	<Tabs.List>
		<Tabs.Tab />
		<Tabs.Indicator />
	</Tabs.List>
	<Tabs.Panel />
</Tabs.Root>
```

## Examples

### Animated panels

Animate panels as they activate using the `data-starting-style` and `data-ending-style` attributes.
The `data-activation-direction` attribute indicates which direction the newly active tab is relative to the previously active one, letting panels slide in from the correct side.

<DemoTabsAnimatedPanels />

### Links

Use the `render` snippet and set `nativeButton={false}` on `<Tabs.Tab>` to render tabs as anchor elements.

```svelte title="Tabs as links"
<script lang="ts">
	import { Tabs } from '@sveltery/base/tabs';
</script>

<Tabs.Root>
	<Tabs.List>
		<!-- @highlight-start -->
		<!-- @highlight-text "nativeButton={false}" -->
		<Tabs.Tab nativeButton={false} value="overview">
			<!-- @highlight-text "render" -->
			{#snippet render(props, state, children)}
				<a href="/overview" {...props}>{@render children?.()}</a>
			{/snippet}
			Overview
		</Tabs.Tab>
		<!-- @highlight-end -->
	</Tabs.List>
	<!-- ... -->
</Tabs.Root>
```

## API reference

<script>
	import { DemoTabsHero } from './demos/hero';
	import { DemoTabsAnimatedPanels } from './demos/animated-panels';
	import { TypesTabs } from './types';
</script>

### Root

<TypesTabs.Root />

### List

<TypesTabs.List />

### Tab

<TypesTabs.Tab />

### Indicator

<TypesTabs.Indicator />

### Panel

<TypesTabs.Panel />
