# Field

<Subtitle>
  A component that provides labeling and validation for form controls.
</Subtitle>

<Meta name="description" content="A component that provides labeling and validation for form controls." />

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root class="flex w-full max-w-64 flex-col items-start gap-1">
	<Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">Name</Field.Label>
	<Field.Control
		required
		placeholder="Required"
		class="h-8 self-stretch border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
	/>
	<Field.Error class="text-sm text-red-700 dark:text-red-400" match="valueMissing">
		Please enter your name
	</Field.Error>

	<Field.Description class="text-sm text-neutral-600 dark:text-neutral-400">
		Visible on your profile
	</Field.Description>
</Field.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Field } from '@sveltery/base/field';
</script>

<Field.Root>
	<Field.Label />
	<Field.Control />
	<Field.Description />
	<Field.Item />
	<Field.Error />
	<Field.Validity />
</Field.Root>
```

## API reference

<script>
	import { TypesField } from './types';
</script>

### Root

<TypesField.Root />

### Label

<TypesField.Label />

### Control

<TypesField.Control />

### Description

<TypesField.Description />

### Item

<TypesField.Item />

### Error

<TypesField.Error />

### Validity

<TypesField.Validity />
