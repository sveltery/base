# Fieldset

<Subtitle>
  A native fieldset element with an easily stylable legend.
</Subtitle>

<Meta name="description" content="A native fieldset element with an easily stylable legend." />

<DemoFieldsetHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Fieldset } from '@sveltery/base/fieldset';
</script>

<Fieldset.Root>
	<Fieldset.Legend />
</Fieldset.Root>
```

## API reference

<script>
	import { DemoFieldsetHero } from './demos/hero';
	import { TypesFieldset } from './types';
</script>

### Root

<TypesFieldset.Root />

### Legend

<TypesFieldset.Legend />
