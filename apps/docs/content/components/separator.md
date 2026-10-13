---
title: Separator
description: A separator element accessible to screen readers.
---

```svelte demo
<script lang="ts">
	import { Separator } from '@sveltery/base/separator';

	const link =
		'flex h-8 items-center justify-center rounded-sm px-2 text-sm font-medium text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:text-gray-100 dark:hover:bg-gray-800';
</script>

<div class="flex items-center gap-2">
	<a href="#home" class={link}>Home</a>
	<a href="#pricing" class={link}>Pricing</a>
	<a href="#blog" class={link}>Blog</a>
	<a href="#support" class={link}>Support</a>

	<Separator orientation="vertical" class="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />

	<a href="#login" class={link}>Log in</a>
	<a href="#signup" class={link}>Sign up</a>
</div>
```

## Anatomy

Import the component and use it as a single part:

```svelte
<script lang="ts">
	import { Separator } from '@sveltery/base/separator';
</script>

<Separator />
```

## Examples

### Horizontal

The separator is horizontal by default. Give it a height and a background, or a border, so it is visible.

```svelte demo
<script lang="ts">
	import { Separator } from '@sveltery/base/separator';
</script>

<div class="w-64 text-sm text-gray-900 dark:text-gray-100">
	<h3 class="font-medium">Account</h3>
	<p class="text-gray-600 dark:text-gray-400">Manage your profile and billing.</p>
	<Separator class="my-3 h-px bg-gray-300 dark:bg-gray-600" />
	<p>Last sign-in: today</p>
</div>
```

### Vertical

Set `orientation="vertical"` to divide items in a row. The part sets `aria-orientation` to match. Style an orientation with the `data-orientation` attribute, such as `data-[orientation=vertical]:w-px`.

```svelte demo
<script lang="ts">
	import { Separator } from '@sveltery/base/separator';
</script>

<div class="flex h-6 items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<span>Bold</span>
	<Separator orientation="vertical" class="h-full w-px bg-gray-300 dark:bg-gray-600" />
	<span>Italic</span>
	<Separator orientation="vertical" class="h-full w-px bg-gray-300 dark:bg-gray-600" />
	<span>Underline</span>
</div>
```

### Decorative separator

The separator has `role="separator"`, so screen readers announce it. If a line is purely decorative, set `role="none"` on it. A prop you pass overrides the role the part sets.

```svelte
<Separator role="none" class="h-px bg-gray-300" />
```

## Differences from Base UI

- Separator has no state to bind and no change callback, so there is no `$bindable` prop and no `eventDetails.cancel()`.
- Parts take `class` and a `style` string, not functions of state. Style the orientation with `data-[orientation=vertical]`.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use Svelte's lowercase names, such as `onclick`.
- `Toolbar` has no separator part yet, and Menu and Select are not ported. Use `Separator` where you need a divider.
- The props you pass are spread after the ones the part sets, so a value you give for `role` or `aria-orientation` wins.

## API reference

### Separator

<ApiPart name="separator" part="Separator" />

| Attribute          | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator: `horizontal` or `vertical`. |

The part also sets `role="separator"` and `aria-orientation`.
