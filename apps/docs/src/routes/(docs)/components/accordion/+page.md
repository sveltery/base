# Accordion

<Subtitle>
  A set of collapsible panels with headings.
</Subtitle>

<Meta name="description" content="A set of collapsible panels with headings." />

<DemoAccordionHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Accordion } from '@sveltery/base/accordion';
</script>

<Accordion.Root>
	<Accordion.Item>
		<Accordion.Header>
			<Accordion.Trigger />
		</Accordion.Header>
		<Accordion.Panel />
	</Accordion.Item>
</Accordion.Root>
```

## Examples

### Open multiple panels

You can set up the accordion to allow multiple panels to be open at the same time using the `multiple` prop.

<DemoAccordionMultiple />

### Hidden until found

The `hiddenUntilFound` prop hides closed panels with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search their contents and reveal the matching panel automatically. It can be set on each `Accordion.Panel`, or once on `Accordion.Root` to apply to all panels.

To try it, press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>Cmd</kbd>+<kbd>F</kbd> on macOS) and search for "restocking"—the browser opens the closed panel containing the match. When `hiddenUntilFound` is enabled, closed panels always remain mounted in the DOM, which also makes their contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep panels hidden until their trigger opens them, and find-in-page skips over the contents.

<DemoAccordionHiddenUntilFound />

## API reference

<script>
	import { DemoAccordionHero } from './demos/hero';
	import { DemoAccordionMultiple } from './demos/multiple';
	import { DemoAccordionHiddenUntilFound } from './demos/hidden-until-found';
	import { TypesAccordion } from './types';
</script>

### Root

<TypesAccordion.Root />

### Item

<TypesAccordion.Item />

### Header

<TypesAccordion.Header />

### Trigger

<TypesAccordion.Trigger />

### Panel

<TypesAccordion.Panel />
