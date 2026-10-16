---
title: Fieldset
description: A native fieldset element with an easily stylable legend.
---

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';
</script>

<Fieldset.Root class="flex w-full max-w-64 flex-col gap-4">
	<Fieldset.Legend
		class="border-b border-neutral-950 text-base font-bold text-neutral-950 dark:border-white dark:text-white"
	>
		Billing details
	</Fieldset.Legend>

	<Field.Root class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Company</Field.Label>
		<Field.Control
			placeholder="Enter company name"
			class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
		/>
	</Field.Root>

	<Field.Root class="flex flex-col items-start gap-1">
		<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Tax ID</Field.Label>
		<Field.Control
			placeholder="Enter fiscal number"
			class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
		/>
	</Field.Root>
</Fieldset.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Fieldset } from '@sveltery/base/fieldset';
</script>

<Fieldset.Root>
	<Fieldset.Legend />
</Fieldset.Root>
```

## API reference

### Root

<ApiPart name="fieldset" part="Root" />

### Legend

<ApiPart name="fieldset" part="Legend" />

| Attribute       | Description                            |
| --------------- | -------------------------------------- |
| `data-disabled` | Present when the fieldset is disabled. |
