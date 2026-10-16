---
title: Avatar
description: An easily stylable avatar component.
---

```svelte demo
<script lang="ts">
	import { Avatar } from '@sveltery/base/avatar';
</script>

<div class="flex gap-4">
	<Avatar.Root
		class="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 align-middle text-sm leading-none font-normal text-neutral-950 select-none dark:bg-neutral-800 dark:text-white"
	>
		<Avatar.Image
			src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
			width="48"
			height="48"
			class="size-full object-cover"
		/>
		<Avatar.Fallback delay={600} class="flex size-full items-center justify-center text-sm">
			LT
		</Avatar.Fallback>
	</Avatar.Root>
	<Avatar.Root
		class="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 align-middle text-sm leading-none font-normal text-neutral-950 select-none dark:bg-neutral-800 dark:text-white"
	>
		LT
	</Avatar.Root>
</div>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Avatar } from '@sveltery/base/avatar';
</script>

<Avatar.Root>
	<Avatar.Image src="" />
	<Avatar.Fallback>LT</Avatar.Fallback>
</Avatar.Root>
```

## Optimized and lazy-loaded images

By default, `<Avatar.Image>` preloads `src` and renders the image only once it has loaded. This doesn't compose with image optimizers that serve a different URL than the raw `src`, or with `loading="lazy"`.

Add the `keepMounted` prop to render the image element right away and let it load in place. Only the image that is actually displayed is requested. To render your own image component, pass a `render` snippet and spread `props` onto it:

```svelte title="Using a custom image component"
<Avatar.Root>
	<Avatar.Fallback>LT</Avatar.Fallback>
	<Avatar.Image keepMounted src="/avatar.png">
		{#snippet render(props)}
			<MyImage {...props} width={32} height={32} alt="" />
		{/snippet}
	</Avatar.Image>
</Avatar.Root>
```

### Stacking

With `keepMounted`, the image and the fallback are both present until the image loads. The image is hidden from assistive technology until then, so the fallback provides the accessible name on its own.

Stack the two in the same box, and place `<Avatar.Image>` after `<Avatar.Fallback>`. Both are positioned, so whichever comes later in the DOM paints on top. The fallback then shows through until the image covers it.

A loading image paints nothing, so the fallback shows through on its own. An image that failed to load paints a broken-image icon on top of it. Hide the image in either state with the `data-loading` and `data-error` attributes:

```css title="Stacked image and fallback"
.Root {
	position: relative;
}

.Image,
.Fallback {
	position: absolute;
	inset: 0;
}

.Image[data-loading],
.Image[data-error] {
	visibility: hidden;
}
```

Avoid `display: none` here: an element without a box never intersects the viewport, so `loading="lazy"` would never fetch the image. `visibility` and `opacity` both keep lazy loading working.

### Server rendering

With `keepMounted`, the image is part of the server-rendered HTML and starts loading before hydration. So is the fallback, which stays visible until hydration resolves the loading status. A cached image is displayed immediately, without an enter animation.

## API reference

### Root

<ApiPart name="avatar" part="Root" />

### Image

<ApiPart name="avatar" part="Image" />

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-error`          | Present when the image failed to load.      |
| `data-loading`        | Present while the image is loading.         |
| `data-starting-style` | Present when the image begins animating in. |
| `data-ending-style`   | Present when the image is animating out.    |

With `keepMounted`, the image sets `data-error` and `data-loading`. Without it, the `<img>` renders only after it loads, so neither is present.

### Fallback

<ApiPart name="avatar" part="Fallback" />

## Additional types

### ImageLoadingStatus

```ts
type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
```
