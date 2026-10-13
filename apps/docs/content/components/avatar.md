---
title: Avatar
description: A stylable avatar component.
---

```svelte demo
<script lang="ts">
	import { Avatar } from '@sveltery/base/avatar';

	const broken = 'data:image/png;base64,AAAA';
	const portrait =
		'data:image/svg+xml,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#3b82f6"/><circle cx="24" cy="19" r="9" fill="#bfdbfe"/><path d="M6 48c2-12 10-16 18-16s16 4 18 16z" fill="#bfdbfe"/></svg>'
		);
</script>

<div class="flex items-center gap-4">
	<Avatar.Root
		class="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 align-middle text-base font-medium text-gray-900 select-none dark:bg-gray-800 dark:text-gray-100"
	>
		<Avatar.Image
			src={portrait}
			width="48"
			height="48"
			alt="Laurence Tigerlily"
			class="size-full object-cover"
		/>
		<Avatar.Fallback>LT</Avatar.Fallback>
	</Avatar.Root>
	<Avatar.Root
		class="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 align-middle text-base font-medium text-gray-900 select-none dark:bg-gray-800 dark:text-gray-100"
	>
		<Avatar.Image src={broken} width="48" height="48" alt="" class="size-full object-cover" />
		<Avatar.Fallback>LT</Avatar.Fallback>
	</Avatar.Root>
</div>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Avatar } from '@sveltery/base/avatar';
</script>

<Avatar.Root>
	<Avatar.Image src="" />
	<Avatar.Fallback>LT</Avatar.Fallback>
</Avatar.Root>
```

## Examples

### Fallback

`Avatar.Fallback` renders while the image has not loaded. That covers an image that is still loading and an image that failed. The second avatar above points at a source that cannot load, so it shows the initials.

### Delay the fallback

Set `delay` on the fallback to wait before it appears. A fast image then loads without a flash of initials. The delay is in milliseconds.

```svelte demo
<script lang="ts">
	import { Avatar } from '@sveltery/base/avatar';

	const broken = 'data:image/png;base64,AAAA';
</script>

<Avatar.Root
	class="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-base font-medium text-gray-900 select-none dark:bg-gray-800 dark:text-gray-100"
>
	<Avatar.Image src={broken} width="48" height="48" alt="" class="size-full object-cover" />
	<Avatar.Fallback delay={600}>LT</Avatar.Fallback>
</Avatar.Root>
```

Once the fallback has been shown, a later change to `delay` does not hide it again.

### Loading status

`Avatar.Image` calls `onLoadingStatusChange` with `'loading'`, `'loaded'`, or `'error'`. It does not call it with `'idle'`. Use the callback to react to the result, for example to log a broken URL.

```svelte demo
<script lang="ts">
	import { Avatar, type ImageLoadingStatus } from '@sveltery/base/avatar';

	const broken = 'data:image/png;base64,AAAA';
	let status = $state<ImageLoadingStatus | 'none'>('none');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Avatar.Root
		class="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 font-medium select-none dark:bg-gray-800"
	>
		<Avatar.Image
			src={broken}
			alt=""
			class="size-full object-cover"
			onLoadingStatusChange={(next) => (status = next)}
		/>
		<Avatar.Fallback>LT</Avatar.Fallback>
	</Avatar.Root>
	<p>Last status: <code>{status}</code></p>
</div>
```

### Keep the image mounted

By default, `Avatar.Image` loads the source in a detached image and renders the `<img>` only after it loads. Set `keepMounted` to render the `<img>` right away. The browser then handles `loading="lazy"`, `srcset`, and server-rendered images, and the part reads the loading status from the element.

With `keepMounted`, the fallback stays visible until the image loads. Stack both parts in the same box and place the image after the fallback so it paints on top. Hide the image while it loads or after an error with its data attributes. Avoid `display: none`, because it prevents lazy loading.

```svelte demo
<script lang="ts">
	import { Avatar } from '@sveltery/base/avatar';

	const portrait =
		'data:image/svg+xml,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#1d4ed8"/><circle cx="24" cy="19" r="9" fill="#dbeafe"/><path d="M6 48c2-12 10-16 18-16s16 4 18 16z" fill="#dbeafe"/></svg>'
		);
</script>

<Avatar.Root
	class="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-base font-medium text-gray-900 select-none dark:bg-gray-800 dark:text-gray-100"
>
	<Avatar.Fallback class="absolute inset-0 flex items-center justify-center">LT</Avatar.Fallback>
	<Avatar.Image
		keepMounted
		src={portrait}
		alt="Laurence Tigerlily"
		class="absolute inset-0 size-full object-cover data-[error]:invisible data-[loading]:invisible"
	/>
</Avatar.Root>
```

### Custom image element

Use the `render` snippet to replace the `<img>`, for example to use an image component from your framework. The snippet receives `(props, state, children)`. Spread `props` onto your element.

```svelte
<Avatar.Image keepMounted src="/avatar.png">
	{#snippet render(props)}
		<MyImage {...props} width={48} height={48} />
	{/snippet}
</Avatar.Image>
```

## Differences from Base UI

- Avatar has no controlled or default state, so there is no `$bindable` prop to learn. Read the loading status with `onLoadingStatusChange` or from the state that a `render` snippet receives.
- `Avatar.Image` takes `src` and the other `<img>` attributes as plain props. Handlers use Svelte's lowercase names, such as `onload` and `onerror`. A `keepMounted` image ignores a `load` or `error` event if your handler calls `event.preventDefault()`.
- `onLoadingStatusChange` has no `eventDetails` argument, so there is nothing to cancel with `eventDetails.cancel()`.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.

## API reference

### Root

<ApiPart name="avatar" part="Root" />

`Avatar.Root` sets no data attributes.

### Image

<ApiPart name="avatar" part="Image" />

| Attribute             | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `data-loading`        | Present while the image is loading. Set only when `keepMounted` is true.    |
| `data-error`          | Present when the image failed to load. Set only when `keepMounted` is true. |
| `data-starting-style` | Present when the image is animating in.                                     |
| `data-ending-style`   | Present when the image is animating out.                                    |

With `keepMounted`, the image also sets `aria-hidden` until it has loaded.

### Fallback

<ApiPart name="avatar" part="Fallback" />

`Avatar.Fallback` sets no data attributes.
