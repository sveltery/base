---
title: Progress
description: Displays the status of a task that takes a long time.
---

```svelte demo
<script lang="ts">
	import { Progress } from '@sveltery/base/progress';

	let value = $state(20);

	$effect(() => {
		const interval = setInterval(() => {
			value = Math.min(100, Math.round(value + Math.random() * 25));
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<Progress.Root {value} class="grid w-48 grid-cols-2 gap-y-2 text-gray-900 dark:text-gray-100">
	<Progress.Label class="text-sm font-medium">Export data</Progress.Label>
	<Progress.Value class="col-start-2 text-end text-sm" />
	<Progress.Track
		class="col-span-2 block h-1 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700"
	>
		<Progress.Indicator class="block bg-gray-700 transition-all duration-500 dark:bg-gray-300" />
	</Progress.Track>
</Progress.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Progress } from '@sveltery/base/progress';
</script>

<Progress.Root>
	<Progress.Label />
	<Progress.Track>
		<Progress.Indicator />
	</Progress.Track>
	<Progress.Value />
</Progress.Root>
```

## Examples

### Indeterminate

Set `value` to `null`, or to any value that is not finite, when you do not know how far along the task is. The status is then `indeterminate`. The indicator has no width, so animate it yourself with the `data-[indeterminate]` variant. `Progress.Value` renders nothing, and `aria-valuenow` is absent.

```svelte demo
<script lang="ts">
	import { Progress } from '@sveltery/base/progress';
</script>

<Progress.Root value={null} class="flex w-48 flex-col gap-2 text-gray-900 dark:text-gray-100">
	<Progress.Label class="text-sm font-medium">Loading</Progress.Label>
	<Progress.Track class="block h-1 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
		<Progress.Indicator
			class="block w-1/3 animate-pulse bg-gray-700 data-[indeterminate]:rounded-sm dark:bg-gray-300"
		/>
	</Progress.Track>
</Progress.Root>
```

### Range and format

`min` and `max` set the range, and `value` is clamped to it. The status is `complete` when the clamped value equals `max`. Pass `format` with `Intl.NumberFormat` options to show a number instead of a percentage.

```svelte demo
<script lang="ts">
	import { Progress } from '@sveltery/base/progress';

	let value = $state(12);
</script>

<div class="flex w-56 flex-col gap-4 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-3">
		Files
		<input type="range" min="0" max="40" bind:value class="flex-1" />
	</label>
	<Progress.Root
		{value}
		max={40}
		format={{ style: 'decimal' }}
		locale="en-US"
		class="flex flex-col gap-2"
	>
		<div class="flex justify-between">
			<Progress.Label class="font-medium">Uploaded files</Progress.Label>
			<Progress.Value />
		</div>
		<Progress.Track class="block h-1 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
			<Progress.Indicator
				class="block bg-gray-700 data-[complete]:bg-blue-700 dark:bg-gray-300 dark:data-[complete]:bg-blue-400"
			/>
		</Progress.Track>
	</Progress.Root>
</div>
```

### Custom value text

Give `Progress.Value` a child snippet to render your own text. It receives the formatted value and the raw `value`. While the bar is indeterminate, the first argument is `'indeterminate'`.

```svelte demo
<script lang="ts">
	import { Progress } from '@sveltery/base/progress';
</script>

<Progress.Root value={64} class="flex w-48 flex-col gap-2 text-gray-900 dark:text-gray-100">
	<div class="flex justify-between text-sm">
		<Progress.Label class="font-medium">Installing</Progress.Label>
		<Progress.Value>
			{#snippet children(formatted, value)}
				{value === null ? 'Waiting' : `${value} of 100 (${formatted})`}
			{/snippet}
		</Progress.Value>
	</div>
	<Progress.Track class="block h-1 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700">
		<Progress.Indicator class="block bg-gray-700 dark:bg-gray-300" />
	</Progress.Track>
</Progress.Root>
```

### Screen reader text

The root sets `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`. The default `aria-valuetext` is the formatted value, or `indeterminate progress` while indeterminate. `Progress.Label` names the bar through `aria-labelledby`. `Progress.Value` is hidden from assistive technology. Pass `getAriaValueText` to change the announced text, or pass `aria-valuetext` to set it outright.

```svelte
<Progress.Root value={64} getAriaValueText={(formatted) => `${formatted} of the export is done`}>
	…
</Progress.Root>
```

## Differences from Base UI

- `value` is a plain prop. Progress has no controlled and default pair and no change callback, so there is no `bind:value` and no `eventDetails.cancel()`.
- Parts take `class` and a `style` string, not functions of state. Style the status through the data attributes below. `Progress.Indicator` sets its own `width` through `style`, and your `style` string wins when it sets the same property.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Progress.Root` passes its children together with a visually hidden `x` that makes NVDA read the label, so render `children` in full. `Progress.Value` passes `undefined` as `children` when the bar is indeterminate and you gave no child snippet, so call `children?.()`.
- `Progress.Value` takes a child snippet `(formattedValue, value)` instead of a function child.
- Handlers use Svelte's lowercase names, such as `onclick`.

## API reference

### Root

<ApiPart name="progress" part="Root" />

| Attribute            | Description                                 |
| -------------------- | ------------------------------------------- |
| `data-progressing`   | Present while the progress is progressing.  |
| `data-complete`      | Present when the progress has completed.    |
| `data-indeterminate` | Present when the progress is indeterminate. |

### Track

<ApiPart name="progress" part="Track" />

| Attribute            | Description                                 |
| -------------------- | ------------------------------------------- |
| `data-progressing`   | Present while the progress is progressing.  |
| `data-complete`      | Present when the progress has completed.    |
| `data-indeterminate` | Present when the progress is indeterminate. |

### Indicator

<ApiPart name="progress" part="Indicator" />

| Attribute            | Description                                 |
| -------------------- | ------------------------------------------- |
| `data-progressing`   | Present while the progress is progressing.  |
| `data-complete`      | Present when the progress has completed.    |
| `data-indeterminate` | Present when the progress is indeterminate. |

### Value

<ApiPart name="progress" part="Value" />

| Attribute            | Description                                 |
| -------------------- | ------------------------------------------- |
| `data-progressing`   | Present while the progress is progressing.  |
| `data-complete`      | Present when the progress has completed.    |
| `data-indeterminate` | Present when the progress is indeterminate. |

### Label

<ApiPart name="progress" part="Label" />

| Attribute            | Description                                 |
| -------------------- | ------------------------------------------- |
| `data-progressing`   | Present while the progress is progressing.  |
| `data-complete`      | Present when the progress has completed.    |
| `data-indeterminate` | Present when the progress is indeterminate. |
