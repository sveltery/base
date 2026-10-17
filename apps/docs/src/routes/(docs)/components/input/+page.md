# Input

<Subtitle>
  A native input element that automatically works with [Field](/components/field).
</Subtitle>

<Meta name="description" content="A native input element that automatically works with Field." />

<DemoInputHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/handbook/forms).

## Anatomy

Import the component and use it as a single part:

```svelte title="Anatomy"
<script lang="ts">
	import { Input } from '@sveltery/base/input';
</script>

<Input />
```

## API reference

<script>
	import { DemoInputHero } from './demos/hero';
	import { TypesInput } from './types';
</script>

<TypesInput />
