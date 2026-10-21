# Textarea

<Subtitle>
  A native textarea element that automatically works with [Field](/components/field).
</Subtitle>

<Meta name="description" content="A native textarea element that automatically works with Field." />

<DemoTextareaHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/handbook/forms).

## Anatomy

Import the component and use it as a single part:

```svelte title="Anatomy"
<script lang="ts">
	import { Textarea } from '@sveltery/base/textarea';
</script>

<Textarea />
```

In a SvelteKit remote form, spread a field's `as('text')` props onto it. TypeScript rejects the props of any other input type, because a textarea has no `type`.

## API reference

<script>
	import { DemoTextareaHero } from './demos/hero';
	import { TypesTextarea } from './types';
</script>

<TypesTextarea />
