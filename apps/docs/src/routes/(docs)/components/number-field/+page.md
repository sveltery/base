# Number Field

<Subtitle>
  A numeric input element with increment and decrement buttons, and a scrub area.
</Subtitle>

<Meta name="description" content="A numeric input element with increment and decrement buttons, and a scrub area." />

<DemoNumberFieldHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';
</script>

<NumberField.Root>
	<NumberField.ScrubArea>
		<NumberField.ScrubAreaCursor />
	</NumberField.ScrubArea>
	<NumberField.Group>
		<NumberField.Decrement />
		<NumberField.Input />
		<NumberField.Increment />
	</NumberField.Group>
</NumberField.Root>
```

## API reference

<script>
	import { DemoNumberFieldHero } from './demos/hero';
	import { TypesNumberField } from './types';
</script>

### Root

<TypesNumberField.Root />

### ScrubArea

<TypesNumberField.ScrubArea />

### ScrubAreaCursor

<TypesNumberField.ScrubAreaCursor />

### Group

<TypesNumberField.Group />

### Decrement

<TypesNumberField.Decrement />

### Input

<TypesNumberField.Input />

### Increment

<TypesNumberField.Increment />
