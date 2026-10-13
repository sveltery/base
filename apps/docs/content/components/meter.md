---
title: Meter
description: A graphical display of a numeric value within a range.
---

```svelte demo
<script lang="ts">
	import { Meter } from '@sveltery/base/meter';
</script>

<Meter.Root value={24} class="grid w-48 grid-cols-2 gap-y-2 text-gray-900 dark:text-gray-100">
	<Meter.Label class="text-sm font-medium">Storage used</Meter.Label>
	<Meter.Value class="col-start-2 text-end text-sm" />
	<Meter.Track class="col-span-2 block h-2 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
		<Meter.Indicator class="block bg-gray-700 transition-all duration-500 dark:bg-gray-300" />
	</Meter.Track>
</Meter.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Meter } from '@sveltery/base/meter';
</script>

<Meter.Root>
	<Meter.Label />
	<Meter.Track>
		<Meter.Indicator />
	</Meter.Track>
	<Meter.Value />
</Meter.Root>
```

## Examples

### Range

`min` and `max` set the range. The default is 0 to 100. The indicator width is a percentage of that range, and so is the default text unless you set `format`. The part clamps a value outside the range for the indicator, `aria-valuenow`, and the text.

```svelte demo
<script lang="ts">
	import { Meter } from '@sveltery/base/meter';

	let value = $state(35);
</script>

<div class="flex w-56 flex-col gap-4 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-3">
		Temperature
		<input type="range" min="-20" max="60" bind:value class="flex-1" />
	</label>
	<Meter.Root
		{value}
		min={-20}
		max={60}
		format={{ style: 'unit', unit: 'celsius' }}
		locale="en-US"
		class="flex flex-col gap-2"
	>
		<div class="flex justify-between">
			<Meter.Label class="font-medium">Water temperature</Meter.Label>
			<Meter.Value />
		</div>
		<Meter.Track class="block h-2 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
			<Meter.Indicator class="block bg-blue-700 dark:bg-blue-400" />
		</Meter.Track>
	</Meter.Root>
</div>
```

### Format the value

Pass `format` with `Intl.NumberFormat` options to format the clamped value as a number instead of a percentage. `locale` picks the locale. `Meter.Value` renders the formatted text.

```svelte demo
<script lang="ts">
	import { Meter } from '@sveltery/base/meter';
</script>

<Meter.Root
	value={7.5}
	max={10}
	format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
	locale="en-US"
	class="grid w-48 grid-cols-2 gap-y-2 text-gray-900 dark:text-gray-100"
>
	<Meter.Label class="text-sm font-medium">Storage used</Meter.Label>
	<Meter.Value class="col-start-2 text-end text-sm" />
	<Meter.Track class="col-span-2 block h-2 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
		<Meter.Indicator class="block bg-gray-700 dark:bg-gray-300" />
	</Meter.Track>
</Meter.Root>
```

### Custom value text

Give `Meter.Value` a child snippet to render your own text. It receives the formatted value and the raw `value`.

```svelte demo
<script lang="ts">
	import { Meter } from '@sveltery/base/meter';
</script>

<Meter.Root value={42} class="grid w-48 grid-cols-2 gap-y-2 text-gray-900 dark:text-gray-100">
	<Meter.Label class="text-sm font-medium">Battery</Meter.Label>
	<Meter.Value class="col-start-2 text-end text-sm">
		{#snippet children(formatted, value)}
			{value} of 100 ({formatted})
		{/snippet}
	</Meter.Value>
	<Meter.Track class="col-span-2 block h-2 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
		<Meter.Indicator class="block bg-gray-700 dark:bg-gray-300" />
	</Meter.Track>
</Meter.Root>
```

### Screen reader text

The root sets `role="meter"` with `aria-valuenow` and `aria-valuetext`. `Meter.Label` names the meter through `aria-labelledby`. `Meter.Value` is hidden from assistive technology, because the root already announces the value. Pass `getAriaValueText` to change the announced text. It receives the formatted clamped value and the raw `value`.

```svelte
<Meter.Root value={24} getAriaValueText={(formatted) => `${formatted} of your storage is used`}>
	…
</Meter.Root>
```

## Differences from Base UI

- `value` is a plain prop. Meter has no controlled and default pair, so there is no `bind:value` to learn and no change callback.
- Meter has no change callback, so there is no `eventDetails.cancel()`.
- Parts take `class` and a `style` string, not functions of state. The parts have no state, so they set no data attributes. `Meter.Indicator` sets its own `width` through `style`. Your `style` string wins when it sets the same property.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Meter.Root` passes its children together with a visually hidden `x` that makes NVDA read the label, so render `children` in full.
- `Meter.Value` takes a child snippet `(formattedValue, value)` instead of a function child.
- Handlers use Svelte's lowercase names, such as `onclick`.

## API reference

### Root

<ApiPart name="meter" part="Root" />

`Meter.Root` sets `role="meter"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, and `aria-labelledby` when a `Meter.Label` is present. It sets no data attributes.

### Track

<ApiPart name="meter" part="Track" />

`Meter.Track` sets no data attributes.

### Indicator

<ApiPart name="meter" part="Indicator" />

`Meter.Indicator` sets no data attributes. It sets its `width` to the value as a percentage of the range, with `inset-inline-start: 0` and `height: inherit`.

### Value

<ApiPart name="meter" part="Value" />

`Meter.Value` sets no data attributes. It sets `aria-hidden="true"`.

### Label

<ApiPart name="meter" part="Label" />

`Meter.Label` sets no data attributes. It sets `role="presentation"` and an `id` that the root references.
