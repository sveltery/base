---
title: Slider
description: A stylable range input.
---

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root defaultValue={25} class="w-64">
	<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
		<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			<Slider.Thumb
				aria-label="Volume"
				class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
			/>
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root>
	<Slider.Label />
	<Slider.Value />
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<Slider.Thumb />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

## Examples

### Bind the value

Bind `value` to read and change the slider from outside. Without `bind:`, the slider manages its own value, and `defaultValue` sets where it starts. Use `onValueChange` for every change and `onValueCommitted` for the final value after a drag or key press.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';

	let value = $state(40);
	let committed = $state(40);
</script>

<div class="flex w-64 flex-col gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Slider.Root bind:value onValueCommitted={(next) => (committed = next as number)}>
		<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
			<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
				<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
				<Slider.Thumb
					aria-label="Brightness"
					class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
				/>
			</Slider.Track>
		</Slider.Control>
	</Slider.Root>
	<p>Value: {value}</p>
	<p>Committed: {committed}</p>
	<button
		type="button"
		class="self-start rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (value = 80)}
	>
		Set to 80
	</button>
</div>
```

### Label and value

`Slider.Label` names the slider. Click it to focus the thumb. `Slider.Value` renders the value in an `<output>` element, and a range slider joins its values with an en dash. Pass `format` with `Intl.NumberFormat` options to format both the visible text and the accessible value text.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root
	defaultValue={30}
	format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
	locale="en-US"
	class="w-64"
>
	<div class="flex justify-between text-sm text-gray-900 dark:text-gray-100">
		<Slider.Label class="font-medium">Budget</Slider.Label>
		<Slider.Value />
	</div>
	<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
		<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			<Slider.Thumb
				class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
			/>
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

Give a slider without a visible label an `aria-label` on `Slider.Thumb`, as the first demo does. A slider with several thumbs needs an `aria-label` on each thumb, or `getAriaLabel` to compute one from the thumb's index.

### Range slider

Pass an array as the value and render one `Slider.Thumb` per entry. The indicator fills the space between the first and last thumb. Pass `index` to each thumb so a server-rendered range slider knows which value each thumb shows. Without `index`, the thumb takes its order from the DOM after hydration.

`thumbCollisionBehavior` controls what happens when thumbs meet during a pointer interaction. `push` moves the other thumb, `swap` lets the dragged thumb pass, and `none` stops it. `minStepsBetweenValues` keeps the thumbs a number of steps apart.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';

	let range = $state([25, 45]);
	const thumb =
		'size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600';
</script>

<Slider.Root bind:value={range} minStepsBetweenValues={5} class="w-64">
	<div class="flex justify-between text-sm text-gray-900 dark:text-gray-100">
		<Slider.Label class="font-medium">Price range</Slider.Label>
		<Slider.Value />
	</div>
	<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
		<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			<Slider.Thumb index={0} aria-label="Minimum price" class={thumb} />
			<Slider.Thumb index={1} aria-label="Maximum price" class={thumb} />
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

### Steps

`step` snaps the value to multiples of the increment, with `min` as the origin. `largeStep` sets the increment for Page Up, Page Down, and Shift with an arrow key. Decimal steps work.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root defaultValue={300} min={0} max={1000} step={100} largeStep={200} class="w-64">
	<div class="flex justify-between text-sm text-gray-900 dark:text-gray-100">
		<Slider.Label class="font-medium">Steps of 100</Slider.Label>
		<Slider.Value />
	</div>
	<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
		<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			<Slider.Thumb
				class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
			/>
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

### Marks

The slider has no part for tick marks. Position your own marks inside the track at the value's percentage of the range. Pair them with `step` so the thumb snaps to each mark.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';

	const marks = [0, 25, 50, 75, 100];
</script>

<Slider.Root defaultValue={50} step={25} class="w-64">
	<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
		<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			{#each marks as mark (mark)}
				<span
					aria-hidden="true"
					class="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400 dark:bg-gray-500"
					style:left="{mark}%"
				></span>
			{/each}
			<Slider.Thumb
				aria-label="Level"
				class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
			/>
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

### Thumb alignment

By default, the thumb is centered on the value, so at `min` and `max` it overhangs the control. Set `thumbAlignment="edge"` to keep the thumb inside the control. The thumb's edge then meets the control's edge at `min` and `max`. The part measures the thumb to do this. `edge-client-only` gives the same result and renders the thumb only after hydration.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root defaultValue={0} thumbAlignment="edge" class="w-64">
	<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
		<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			<Slider.Thumb
				aria-label="Level"
				class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
			/>
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

### Vertical

Set `orientation="vertical"`. The slider then fills from the bottom, and the root needs a height.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';
</script>

<Slider.Root defaultValue={60} orientation="vertical" class="h-40">
	<Slider.Control class="flex h-full w-5 touch-none justify-center select-none">
		<Slider.Track class="h-full w-1 rounded-sm bg-gray-200 dark:bg-gray-700">
			<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
			<Slider.Thumb
				aria-label="Volume"
				class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600"
			/>
		</Slider.Track>
	</Slider.Control>
</Slider.Root>
```

### Form integration

Set `name` to submit the value with a form. A range slider submits one entry per thumb under the same name. `defaultValue` is also the value a form reset restores. Without it, a reset returns each thumb to `min`.

```svelte demo
<script lang="ts">
	import { Slider } from '@sveltery/base/slider';

	let submitted = $state('');

	function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		submitted = JSON.stringify([...data.entries()]);
	}

	const thumb =
		'size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800 dark:bg-gray-900 dark:outline-gray-600';
</script>

<form onsubmit={submit} class="flex w-64 flex-col gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Slider.Root name="price" defaultValue={[20, 60]}>
		<Slider.Control class="flex w-full touch-none items-center py-3 select-none">
			<Slider.Track class="h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-700">
				<Slider.Indicator class="rounded-sm bg-gray-700 dark:bg-gray-300" />
				<Slider.Thumb index={0} aria-label="Minimum price" class={thumb} />
				<Slider.Thumb index={1} aria-label="Maximum price" class={thumb} />
			</Slider.Track>
		</Slider.Control>
	</Slider.Root>
	<div class="flex gap-2">
		<button
			type="submit"
			class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			Submit
		</button>
		<button
			type="reset"
			class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			Reset
		</button>
	</div>
	<code>{submitted || 'Not submitted'}</code>
</form>
```

## Differences from Base UI

- `value` is one `$bindable` prop. Use `bind:value`, or pass `value` without `bind:` to set the initial value. `defaultValue` stays, because Slider is a form control. It is the value an unbound slider starts from and the value a form reset restores.
- `onValueChange` runs before the value changes. Call `eventDetails.cancel()` to keep the current value. Its details include `activeThumbIndex`. `onValueCommitted` runs when a change ends, so it cannot cancel it.
- A user change fires a bubbling `input` event from the thumb's range input, and a `change` event when the change is committed. A form reset does not call `onValueChange`.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below. The track, indicator, and thumb set their own positioning through `style`, and your `style` string wins when it sets the same property.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Slider.Thumb` passes its children together with its range input, so render `children` in full. `Slider.Value` takes a child snippet `(formattedValues, values)` instead of a function child.
- Handlers use Svelte's lowercase names. On `Slider.Thumb`, `onfocus`, `onblur`, and `onkeydown` go to the nested range input. Call `event.preventDefault()` in `onkeydown` to skip the thumb's own key handling.
- There is no `inputRef`. The range input is in the DOM inside the thumb, and `{@attach}` on `Slider.Thumb` gives you the thumb element.
- Arrow keys change the value. They do not move focus between thumbs, so Tab moves between the thumbs of a range slider.
- `Fieldset` does not disable a slider inside it yet. Set `disabled` on the slider.

## API reference

### Root

<ApiPart name="slider" part="Root" />

| Attribute          | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `data-dragging`    | Present while a thumb is being dragged.                      |
| `data-orientation` | The orientation of the slider: `horizontal` or `vertical`.   |
| `data-disabled`    | Present when the slider is disabled.                         |
| `data-valid`       | Present when the slider is in a `Field.Root` and is valid.   |
| `data-invalid`     | Present when the slider is in a `Field.Root` and is invalid. |
| `data-dirty`       | Present when the value has changed, inside a `Field.Root`.   |
| `data-touched`     | Present when the slider was touched, inside a `Field.Root`.  |
| `data-focused`     | Present when a thumb is focused, inside a `Field.Root`.      |

### Label

<ApiPart name="slider" part="Label" />

`Slider.Label` sets the same data attributes as `Slider.Root`.

### Value

<ApiPart name="slider" part="Value" />

`Slider.Value` sets the same data attributes as `Slider.Root`.

### Control

<ApiPart name="slider" part="Control" />

`Slider.Control` sets the same data attributes as `Slider.Root`.

### Track

<ApiPart name="slider" part="Track" />

`Slider.Track` sets the same data attributes as `Slider.Root`.

### Thumb

<ApiPart name="slider" part="Thumb" />

`Slider.Thumb` sets the same data attributes as `Slider.Root`, and one more.

| Attribute    | Description                                    |
| ------------ | ---------------------------------------------- |
| `data-index` | The index of the thumb in the slider's values. |

### Indicator

<ApiPart name="slider" part="Indicator" />

`Slider.Indicator` sets the same data attributes as `Slider.Root`.
