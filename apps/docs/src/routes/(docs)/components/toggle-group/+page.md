# Toggle Group

<Subtitle>
  Provides a shared state to a series of toggle buttons.
</Subtitle>

<Meta name="description" content="Provides a shared state to a series of toggle buttons." />

<DemoToggleGroupHero />

## Anatomy

Import the component and use it as a single part:

```svelte title="Anatomy"
<script lang="ts">
	import { ToggleGroup } from '@sveltery/base/toggle-group';
</script>

<ToggleGroup />
```

## Examples

### Multiple

Add the `multiple` prop to allow pressing more than one toggle at a time.

<DemoToggleGroupMultiple />

## API reference

<script>
	import { DemoToggleGroupHero } from './demos/hero';
	import { DemoToggleGroupMultiple } from './demos/multiple';
	import { TypesToggleGroup } from './types';
</script>

<TypesToggleGroup />
