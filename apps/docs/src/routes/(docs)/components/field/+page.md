# Field

<Subtitle>
  A component that provides labeling and validation for form controls.
</Subtitle>

<Meta name="description" content="A component that provides labeling and validation for form controls." />

<DemoFieldHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root>
	<Field.Label />
	<Field.Control />
	<Field.Description />
	<Field.Item />
	<Field.Error />
	<Field.Validity />
</Field.Root>
```

## API reference

<script>
	import { DemoFieldHero } from './demos/hero';
	import { TypesField } from './types';
</script>

### Root

<TypesField.Root />

### Label

<TypesField.Label />

### Control

<TypesField.Control />

### Description

<TypesField.Description />

### Item

<TypesField.Item />

### Error

<TypesField.Error />

### Validity

<TypesField.Validity />
