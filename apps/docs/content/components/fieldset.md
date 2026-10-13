---
title: Fieldset
description: A native fieldset element with a stylable legend.
---

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';

	const inputClass =
		'h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
</script>

<Fieldset.Root class="flex w-64 flex-col gap-4">
	<Fieldset.Legend class="text-base font-medium text-gray-900 dark:text-gray-100">
		Billing details
	</Fieldset.Legend>

	<Field.Root class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Company</Field.Label>
		<Field.Control placeholder="Enter company name" class={inputClass} />
	</Field.Root>

	<Field.Root class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">Tax ID</Field.Label>
		<Field.Control placeholder="Enter fiscal number" class={inputClass} />
	</Field.Root>
</Fieldset.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Fieldset } from '@sveltery/base/fieldset';
</script>

<Fieldset.Root>
	<Fieldset.Legend />
</Fieldset.Root>
```

`Fieldset.Root` renders a native `<fieldset>`. `Fieldset.Legend` renders a `<div>` instead of a `<legend>`, so you can style it freely. The root points `aria-labelledby` at the legend, which gives the group its accessible name.

## Examples

### Disable a group of fields

Set `disabled` on the root to disable every control inside it. The native `<fieldset>` disables the controls it contains, and a `Field` inside the fieldset also reports `data-disabled`. A fieldset nested in a disabled fieldset is disabled too.

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';

	let disabled = $state(true);
</script>

<div class="flex w-64 flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={disabled} />
		Disable the fieldset
	</label>
	<Fieldset.Root {disabled} class="flex w-full flex-col gap-3 data-[disabled]:opacity-50">
		<Fieldset.Legend class="text-base font-medium">Shipping address</Fieldset.Legend>
		<Field.Root class="flex flex-col items-start gap-1">
			<Field.Label class="font-medium">Street</Field.Label>
			<Field.Control
				placeholder="1 Main Street"
				class="h-10 w-full rounded-md border border-gray-200 bg-white pl-3.5 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-900"
			/>
		</Field.Root>
	</Fieldset.Root>
</div>
```

## Differences from Base UI

- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use lowercase names such as `onclick`.
- A `Fieldset.Root` disabled state reaches a `Field.Root` and a Radio Group. A Checkbox, Checkbox Group, or Slider that sits outside a `Field.Root` does not read it, so set `disabled` on those controls yourself. Native controls follow the native `<fieldset>`.
- Fieldset has no state beyond `disabled`, so no `bind:` props and no change events exist.

## API reference

### Root

<ApiPart name="fieldset" part="Root" />

| Attribute       | Description                            |
| --------------- | -------------------------------------- |
| `data-disabled` | Present when the fieldset is disabled. |

### Legend

<ApiPart name="fieldset" part="Legend" />

| Attribute       | Description                            |
| --------------- | -------------------------------------- |
| `data-disabled` | Present when the fieldset is disabled. |
