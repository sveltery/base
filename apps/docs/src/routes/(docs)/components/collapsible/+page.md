# Collapsible

<Subtitle>
  A collapsible panel controlled by a button.
</Subtitle>

<Meta name="description" content="A collapsible panel controlled by a button." />

<DemoCollapsibleHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Collapsible } from '@sveltery/base/collapsible';
</script>

<Collapsible.Root>
	<Collapsible.Trigger />
	<Collapsible.Panel />
</Collapsible.Root>
```

## Examples

### Hidden until found

The `hiddenUntilFound` prop hides the closed panel with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search its contents with find-in-page—<kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>Cmd</kbd>+<kbd>F</kbd> on macOS)—and reveal the panel when a match is found. The closed panel always remains mounted in the DOM, which also makes its contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep the panel hidden until its trigger opens it, and find-in-page skips over the contents.

```svelte title="Searchable hidden panel"
<Collapsible.Root>
	<Collapsible.Trigger>Shipping details</Collapsible.Trigger>
	<!-- @highlight-text "hiddenUntilFound" -->
	<Collapsible.Panel hiddenUntilFound>Standard shipping takes 3–5 business days.</Collapsible.Panel>
</Collapsible.Root>
```

See the [Accordion example](/components/accordion#hidden-until-found) for an interactive demo.

## API reference

<script>
	import { DemoCollapsibleHero } from './demos/hero';
	import { TypesCollapsible } from './types';
</script>

### Root

<TypesCollapsible.Root />

### Trigger

<TypesCollapsible.Trigger />

### Panel

<TypesCollapsible.Panel />
