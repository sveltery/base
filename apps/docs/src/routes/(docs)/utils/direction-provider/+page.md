# Direction Provider

<Subtitle>
  Enables RTL behavior for Sveltery Base components.
</Subtitle>

<Meta name="description" content="Enables RTL behavior for Sveltery Base components." />

<DemoDirectionProviderHero />

## Anatomy

Import the component and wrap it around your app:

```svelte title="Anatomy"
<script lang="ts">
	import { DirectionProvider } from '@sveltery/base/direction-provider';
</script>

<DirectionProvider>
	<!-- Your app or a group of components -->
</DirectionProvider>
```

`<DirectionProvider>` enables child Sveltery Base components to adjust behavior based on RTL text direction, but does not affect HTML and CSS. The `dir="rtl"` HTML attribute or `direction: rtl` CSS style must be set additionally by your own application code.

## API reference

<script>
	import { DemoDirectionProviderHero } from './demos/hero';
	import { TypesDirectionProvider } from './types';
</script>

### DirectionProvider

<TypesDirectionProvider />

### useDirection

Use this function to read the current text direction. This is useful for wrapping portaled components that may be rendered outside your application root and are unaffected by the `dir` attribute set within.

Call it while the component initializes. It returns an object instead of a string, so that the `direction` property stays current when the provider's `direction` changes. Read the property in the template, in `$derived`, or in an event handler.

```svelte
<script lang="ts">
	import { useDirection } from '@sveltery/base/direction-provider';

	const reading = useDirection();
</script>

<div dir={reading.direction}>...</div>
```

**Return value**

`DirectionReading`

| Property    | Type            | Modifiers | Description                                                    |
| ----------- | --------------- | --------- | -------------------------------------------------------------- |
| `direction` | `TextDirection` | readonly  | The current text direction. Outside a provider, it is `'ltr'`. |
