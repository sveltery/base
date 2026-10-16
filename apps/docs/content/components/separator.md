---
title: Separator
description: A separator element accessible to screen readers.
---

```svelte demo
<script lang="ts">
	import { Separator } from '@sveltery/base/separator';

	const link =
		'text-sm text-neutral-950 decoration-neutral-300 decoration-1 underline-offset-2 hover:underline focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:decoration-neutral-700';
</script>

<div class="flex gap-4 text-nowrap">
	<a href="#top" class={link}>Home</a>
	<a href="#top" class={link}>Pricing</a>
	<a href="#top" class={link}>Blog</a>
	<a href="#top" class={link}>Support</a>

	<Separator orientation="vertical" class="w-px bg-neutral-300 dark:bg-neutral-700" />

	<a href="#top" class={link}>Log in</a>
	<a href="#top" class={link}>Sign up</a>
</div>
```

## Anatomy

Import the component and use it as a single part:

```svelte title="Anatomy"
<script lang="ts">
	import { Separator } from '@sveltery/base/separator';
</script>

<Separator />
```

## API reference

<ApiPart name="separator" part="Separator" />

| Attribute          | Description                                 |
| ------------------ | ------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator. |
