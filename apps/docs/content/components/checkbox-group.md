---
title: Checkbox Group
description: Provides shared state to a series of checkboxes.
---

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const fruits = [
		{ value: 'fuji-apple', label: 'Fuji' },
		{ value: 'gala-apple', label: 'Gala' },
		{ value: 'granny-smith-apple', label: 'Granny Smith' }
	];
</script>

<CheckboxGroup
	aria-labelledby="apples-caption"
	defaultValue={['fuji-apple']}
	class="flex flex-col items-start gap-1 text-gray-900 dark:text-gray-100"
>
	<div class="font-medium" id="apples-caption">Apples</div>
	{#each fruits as fruit (fruit.value)}
		<label class="flex items-center gap-2">
			<Checkbox.Root
				value={fruit.value}
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
			{fruit.label}
		</label>
	{/each}
</CheckboxGroup>
```

## Anatomy

Import the group and `Checkbox`, then place checkboxes inside the group:

```svelte
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
</script>

<CheckboxGroup>
	<Checkbox.Root />
</CheckboxGroup>
```

## Examples

### Labeling

A group needs an accessible name. Point `aria-labelledby` at a caption, as the demo above does. Inside a `Field.Root`, `Field.Label` names the group. Name each checkbox with an enclosing `<label>`.

### Value

Each checkbox takes a `value`. The group's `value` is the array of values that are ticked. Bind `value` to read and change the array. Without `bind:`, the group manages its own state. Use `defaultValue` to set the initial array of an unbound group.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const toppings = ['cheese', 'olives', 'mushrooms'];
	let value = $state<string[]>(['cheese']);
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<CheckboxGroup bind:value aria-label="Toppings" class="flex flex-col items-start gap-1">
		{#each toppings as topping (topping)}
			<label class="flex items-center gap-2 capitalize">
				<Checkbox.Root
					value={topping}
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
				{topping}
			</label>
		{/each}
	</CheckboxGroup>
	<button
		type="button"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
		onclick={() => (value = toppings)}
	>
		Select every topping
	</button>
	<p>Selected: {value.length ? value.join(', ') : 'none'}</p>
</div>
```

Inside a group, the group value decides whether a checkbox is ticked. A checkbox's own `checked` is ignored. A checkbox without a `value` uses its `name` as its key.

To veto a change, call `eventDetails.cancel()` in `onValueChange`. The group then keeps its current value.

### Parent checkbox

A parent checkbox ticks and unticks every checkbox in the group. To add one:

1. Pass the values of every child checkbox to `allValues`.
2. Set `parent` on the parent `Checkbox.Root`.

The group manages the parent's state. The parent is ticked when every value is ticked and mixed when only some are. Clicking the parent cycles through all, none, and your earlier partial selection.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const fruits = ['fuji-apple', 'gala-apple', 'granny-smith-apple'];
	let value = $state<string[]>([]);
</script>

<CheckboxGroup
	bind:value
	allValues={fruits}
	class="flex flex-col items-start gap-2 text-gray-900 dark:text-gray-100"
>
	<label class="flex items-center gap-2 font-medium">
		<Checkbox.Root
			parent
			class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[indeterminate]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
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
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Apples
	</label>
	{#each fruits as fruit (fruit)}
		<label class="ml-6 flex items-center gap-2 text-sm">
			<Checkbox.Root
				value={fruit}
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
			{fruit}
		</label>
	{/each}
</CheckboxGroup>
```

A parent checkbox is not part of the group's value and is left out of form submission. It sets `aria-controls` to the ids of the child checkboxes. A disabled child that is unticked stays out of the parent's selection. A disabled child that is ticked stays ticked when the parent clears.

### Nested parent checkbox

A parent checkbox can sit inside another group, with a nested group that has its own parent. Keep the two levels in sync with `onValueChange`. This example keeps `manage-users` in the outer value ticked only while every user permission is ticked.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const mainPermissions = ['view-dashboard', 'manage-users', 'access-reports'];
	const userPermissions = ['create-user', 'edit-user', 'delete-user'];

	let mainValue = $state<string[]>([]);
	let userValue = $state<string[]>([]);
	const allUsersChecked = $derived(userValue.length === userPermissions.length);
	const someUsersChecked = $derived(userValue.length > 0 && !allUsersChecked);
</script>

<CheckboxGroup
	value={mainValue}
	allValues={mainPermissions}
	onValueChange={(next) => {
		if (next.includes('manage-users')) {
			userValue = userPermissions;
		} else if (allUsersChecked) {
			userValue = [];
		}
		mainValue = next;
	}}
	class="flex flex-col items-start gap-2 text-sm text-gray-900 dark:text-gray-100"
>
	<label class="flex items-center gap-2 font-medium">
		<Checkbox.Root
			parent
			indeterminate={someUsersChecked}
			class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[indeterminate]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
		>
			<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
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
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Permissions
	</label>
	<label class="ml-6 flex items-center gap-2">
		<Checkbox.Root
			value="view-dashboard"
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
		View dashboard
	</label>
	<label class="ml-6 flex items-center gap-2">
		<Checkbox.Root
			value="access-reports"
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
		Access reports
	</label>

	<CheckboxGroup
		value={userValue}
		allValues={userPermissions}
		onValueChange={(next) => {
			mainValue =
				next.length === userPermissions.length
					? [...new Set([...mainValue, 'manage-users'])]
					: mainValue.filter((item) => item !== 'manage-users');
			userValue = next;
		}}
		class="ml-6 flex flex-col items-start gap-2"
	>
		<label class="flex items-center gap-2">
			<Checkbox.Root
				parent
				class="flex size-5 items-center justify-center rounded-sm outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 dark:data-[checked]:bg-gray-100 dark:data-[indeterminate]:bg-gray-100 dark:data-[unchecked]:border-gray-600"
			>
				<Checkbox.Indicator class="flex text-gray-50 dark:text-gray-900">
					{#snippet render(props, state)}
						<span {...props}>
							{#if state.indeterminate}
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
						</span>
					{/snippet}
				</Checkbox.Indicator>
			</Checkbox.Root>
			Manage users
		</label>
		{#each userPermissions as permission (permission)}
			<label class="ml-6 flex items-center gap-2">
				<Checkbox.Root
					value={permission}
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
				{permission}
			</label>
		{/each}
	</CheckboxGroup>
</CheckboxGroup>
```

### Form submission

Checkboxes in a group submit as separate entries. Set the same `name` on each checkbox and give each a `value`. The form then holds one entry per ticked checkbox.

```svelte demo
<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const colors = ['red', 'green', 'blue'];
	let submitted = $state('');
</script>

<form
	class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100"
	onsubmit={(event) => {
		event.preventDefault();
		submitted = new FormData(event.currentTarget).getAll('colors').join(', ');
	}}
>
	<CheckboxGroup
		aria-label="Colors"
		defaultValue={['green']}
		class="flex flex-col items-start gap-1"
	>
		{#each colors as color (color)}
			<label class="flex items-center gap-2 capitalize">
				<Checkbox.Root
					name="colors"
					value={color}
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
				{color}
			</label>
		{/each}
	</CheckboxGroup>
	<button
		type="submit"
		class="rounded-sm bg-gray-100 px-2 py-1 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		Submit
	</button>
	<output class="font-mono text-xs">{submitted || 'Nothing submitted yet'}</output>
</form>
```

## Differences from Base UI

- `value` is one bindable prop. Use `bind:value` instead of `value` and `onValueChange` together. Checkbox Group keeps `defaultValue`, because it is a form control. It is the array an empty binding starts from and the array a form reset restores.
- `onValueChange` runs before the value changes. Call `eventDetails.cancel()` to keep the group as it is.
- Handlers use lowercase names, such as `onclick`.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Inside a `Field.Root`, the group registers as the field's control. It reports its whole `value` to `onFormSubmit` and `validate`. Upstream drops values whose checkbox is disabled or belongs to another form. The port does not filter them yet.
- The group claims the field's label, so `Field.Label` does not set `for` on a checkbox inside the group.

## API reference

### CheckboxGroup

<ApiPart name="checkbox-group" part="CheckboxGroup" />

| Attribute       | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `data-disabled` | Present when the group is disabled.                                    |
| `data-valid`    | Present when the group is valid. Set only inside `Field.Root`.         |
| `data-invalid`  | Present when the group is invalid. Set only inside `Field.Root`.       |
| `data-dirty`    | Present when the value has changed. Set only inside `Field.Root`.      |
| `data-touched`  | Present when the group has been touched. Set only inside `Field.Root`. |
| `data-filled`   | Present when a checkbox is ticked. Set only inside `Field.Root`.       |
| `data-focused`  | Present when the group has focus. Set only inside `Field.Root`.        |
