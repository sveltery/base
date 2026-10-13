---
title: Checkbox
description: An easily stylable checkbox component.
---

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
</script>

<label class="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
	<Checkbox.Root
		defaultChecked
		class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
	>
		<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
			<svg viewBox="0 0 10 10" class="size-3" fill="currentColor" aria-hidden="true">
				<path
					d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
				/>
			</svg>
		</Checkbox.Indicator>
	</Checkbox.Root>
	Enable notifications
</label>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
</script>

<Checkbox.Root>
	<Checkbox.Indicator />
</Checkbox.Root>
```

## Examples

### Labeling

A checkbox needs an accessible name. Wrap the checkbox and its text in a `<label>`, as the demo above does. You can also name a checkbox with `Field.Label` inside a `Field.Root`.

### Checked state

Bind `checked` to read and change whether the checkbox is ticked. Without `bind:`, the checkbox manages its own state. Use `defaultChecked` to set the initial state of an unbound checkbox.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';

	let checked = $state(false);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<Checkbox.Root
			bind:checked
			class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
				<svg viewBox="0 0 10 10" class="size-3" fill="currentColor" aria-hidden="true">
					<path
						d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
					/>
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Accept the terms
	</label>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (checked = !checked)}
	>
		The terms are {checked ? 'accepted' : 'not accepted'}
	</button>
</div>
```

To veto a change, call `eventDetails.cancel()` in `onCheckedChange`. The checkbox then keeps its current state.

### Indeterminate

Set `indeterminate` to show a mixed state. While the checkbox is mixed, `aria-checked` is `mixed` and the root and indicator set neither `data-checked` nor `data-unchecked`. The indicator stays rendered, so style it with `data-[indeterminate]`.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';

	let checked = $state(false);
	let indeterminate = $state(true);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<Checkbox.Root
			bind:checked
			{indeterminate}
			onCheckedChange={() => (indeterminate = false)}
			class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[indeterminate]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
				{#if indeterminate}
					<svg
						viewBox="0 0 10 10"
						class="size-3"
						fill="none"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path d="M2 5h6" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				{:else}
					<svg viewBox="0 0 10 10" class="size-3" fill="currentColor" aria-hidden="true">
						<path
							d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
						/>
					</svg>
				{/if}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Select all
	</label>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (indeterminate = !indeterminate)}
	>
		Mixed state: {indeterminate ? 'on' : 'off'}
	</button>
</div>
```

### Native button

`Checkbox.Root` renders a `<span>` and a hidden `<input>` by default. To use a sibling `<label for>`, set `nativeButton` and render a `<button>` with the `render` snippet. The `id` then goes on the button, so the label points at it.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
</script>

<div class="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
	<label for="native-button-checkbox">Subscribe to updates</label>
	<Checkbox.Root
		id="native-button-checkbox"
		nativeButton
		class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
	>
		{#snippet render(props, _state, children)}
			<button type="button" {...props}>{@render children?.()}</button>
		{/snippet}
		<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
			<svg viewBox="0 0 10 10" class="size-3" fill="currentColor" aria-hidden="true">
				<path
					d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
				/>
			</svg>
		</Checkbox.Indicator>
	</Checkbox.Root>
</div>
```

To wrap a native button in a `<label>`, render the label from the `render` snippet. The hidden input then stays outside the label, so the markup is valid.

```svelte
<Checkbox.Root nativeButton>
	{#snippet render(props, _state, children)}
		<label>
			<button type="button" {...props}>{@render children?.()}</button>
			Subscribe to updates
		</label>
	{/snippet}
</Checkbox.Root>
```

### Form submission

Set `name` to submit the checkbox with a form. A ticked checkbox submits its `value`, or `on` when you set no `value`. An unticked checkbox submits nothing, unless you set `uncheckedValue`.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';

	let submitted = $state('');
</script>

<form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onsubmit={(event) => {
		event.preventDefault();
		submitted = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
	}}
>
	<label class="flex items-center gap-2">
		<Checkbox.Root
			name="newsletter"
			value="yes"
			uncheckedValue="no"
			class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
				<svg viewBox="0 0 10 10" class="size-3" fill="currentColor" aria-hidden="true">
					<path
						d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
					/>
				</svg>
			</Checkbox.Indicator>
		</Checkbox.Root>
		Subscribe to the newsletter
	</label>
	<button
		type="submit"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		Submit
	</button>
	<output class="font-mono text-xs">{submitted || 'Nothing submitted yet'}</output>
</form>
```

### Animate the indicator

The indicator sets `data-starting-style` when it mounts and `data-ending-style` while it unmounts. Transition from those states to animate the indicator in and out. Set `keepMounted` on the indicator to keep it in the DOM while the checkbox is unticked.

```css
.indicator {
	transition: opacity 150ms ease-out;
}

.indicator[data-starting-style],
.indicator[data-ending-style] {
	opacity: 0;
}
```

## Differences from Base UI

- `checked` is one bindable prop. Use `bind:checked` instead of `checked` and `onCheckedChange` together. A checkbox with no binding manages its own state. Checkbox keeps `defaultChecked`, because it is a form control. It is the state an empty binding starts from and the state a form reset restores. The other form controls that keep `defaultValue` or `defaultChecked` are Checkbox Group, Switch, Radio Group, Slider, Number Field, OTP Field, and `Field.Control`.
- `onCheckedChange` runs before the state changes. Call `eventDetails.cancel()` to keep the checkbox as it is.
- Use `readonly` in lowercase, as on an HTML input. The state key is still `readOnly`.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in `onclick` to skip the checkbox's own click handler.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- A native form reset restores `defaultChecked`. The visible state of the checkbox catches up one task after the reset.
- Inside a Checkbox Group, the group value decides whether a checkbox is ticked. The checkbox takes its `value`, or its `name`, as its key in the group.
- `inputRef` is not available.

## API reference

### Root

<ApiPart name="checkbox" part="Root" />

| Attribute            | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `data-checked`       | Present when the checkbox is ticked and not mixed.                        |
| `data-unchecked`     | Present when the checkbox is unticked and not mixed.                      |
| `data-indeterminate` | Present when the checkbox is mixed.                                       |
| `data-disabled`      | Present when the checkbox is disabled.                                    |
| `data-readonly`      | Present when the checkbox is read-only.                                   |
| `data-required`      | Present when the checkbox is required.                                    |
| `data-parent`        | Present when the checkbox is a parent checkbox.                           |
| `data-valid`         | Present when the checkbox is valid. Set only inside `Field.Root`.         |
| `data-invalid`       | Present when the checkbox is invalid. Set only inside `Field.Root`.       |
| `data-dirty`         | Present when the value has changed. Set only inside `Field.Root`.         |
| `data-touched`       | Present when the checkbox has been touched. Set only inside `Field.Root`. |
| `data-filled`        | Present when the checkbox is ticked. Set only inside `Field.Root`.        |
| `data-focused`       | Present when the checkbox has focus. Set only inside `Field.Root`.        |

### Indicator

<ApiPart name="checkbox" part="Indicator" />

| Attribute             | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `data-checked`        | Present when the checkbox is ticked and not mixed.                        |
| `data-unchecked`      | Present when the checkbox is unticked and not mixed. Needs `keepMounted`. |
| `data-indeterminate`  | Present when the checkbox is mixed.                                       |
| `data-disabled`       | Present when the checkbox is disabled.                                    |
| `data-readonly`       | Present when the checkbox is read-only.                                   |
| `data-required`       | Present when the checkbox is required.                                    |
| `data-valid`          | Present when the checkbox is valid. Set only inside `Field.Root`.         |
| `data-invalid`        | Present when the checkbox is invalid. Set only inside `Field.Root`.       |
| `data-dirty`          | Present when the value has changed. Set only inside `Field.Root`.         |
| `data-touched`        | Present when the checkbox has been touched. Set only inside `Field.Root`. |
| `data-filled`         | Present when the checkbox is ticked. Set only inside `Field.Root`.        |
| `data-focused`        | Present when the checkbox has focus. Set only inside `Field.Root`.        |
| `data-starting-style` | Present when the indicator is animating in.                               |
| `data-ending-style`   | Present when the indicator is animating out.                              |
