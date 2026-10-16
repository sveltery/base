---
title: Direction Provider
description: Enables RTL behavior for Sveltery Base components.
order: 2
---

```svelte demo
<script lang="ts">
	import { DirectionProvider } from '@sveltery/base/direction-provider';
	import { Slider } from '@sveltery/base/slider';
</script>

<div dir="rtl">
	<DirectionProvider direction="rtl">
		<Slider.Root defaultValue={25}>
			<Slider.Control class="flex w-56 touch-none items-center py-3 select-none">
				<Slider.Track class="h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800">
					<Slider.Indicator class="bg-neutral-950 select-none dark:bg-white" />
					<Slider.Thumb
						aria-label="Volume"
						class="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:has-[:focus-visible]:outline-white"
					/>
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	</DirectionProvider>
</div>
```

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

### DirectionProvider

<ApiPart name="direction-provider" part="DirectionProvider" />

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
