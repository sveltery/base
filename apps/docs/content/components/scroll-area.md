---
title: Scroll Area
description: A native scroll container with custom scrollbars.
---

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root
	class="h-36 w-80 max-w-full rounded-md bg-clip-padding text-gray-900 outline outline-1 -outline-offset-1 outline-gray-200 dark:text-gray-100 dark:outline-gray-700"
>
	<ScrollArea.Viewport
		class="h-full rounded-md focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800"
	>
		<ScrollArea.Content class="flex flex-col gap-4 py-3 pr-6 pl-4 text-sm leading-[1.375rem]">
			<p>
				Vernacular architecture is building done without architects. It uses local materials and
				answers local needs, so the same idea looks different in every region.
			</p>
			<p>
				Traditional timber frames, adobe walls, and thatched roofs often keep a building cool in
				summer and warm in winter without any machinery.
			</p>
			<p>
				Many modern architects study these buildings to learn how people lived with the climate
				before they could fight it.
			</p>
			<p>
				A good example is the courtyard house, which has appeared in many cultures and gives shade,
				privacy, and fresh air.
			</p>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar
		class="pointer-events-none m-1 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity duration-150 data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[hovering]:duration-75 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-75 dark:bg-gray-700"
	>
		<ScrollArea.Thumb class="w-full rounded bg-gray-500 dark:bg-gray-400" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root>
	<ScrollArea.Viewport>
		<ScrollArea.Content />
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar>
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>
```

## Examples

### Both scrollbars

Add a second `ScrollArea.Scrollbar` with `orientation="horizontal"` for horizontal scrolling. Add a `ScrollArea.Corner` so the two scrollbars do not overlap. The root needs a fixed size, and the content needs to overflow it.

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';

	const scrollbar =
		'pointer-events-none m-1 flex justify-center rounded bg-gray-200 opacity-0 transition-opacity duration-150 data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[hovering]:duration-75 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-75 data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1 dark:bg-gray-700';
</script>

<ScrollArea.Root
	class="h-48 w-80 max-w-full rounded-md bg-clip-padding text-gray-900 outline outline-1 -outline-offset-1 outline-gray-200 dark:text-gray-100 dark:outline-gray-700"
>
	<ScrollArea.Viewport
		class="h-full rounded-md focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800"
	>
		<ScrollArea.Content class="p-4">
			<ul class="m-0! grid w-[32rem] list-none! grid-cols-8 gap-2 p-0! text-sm">
				{#each { length: 100 } as _, index (index)}
					<li
						class="my-0! flex size-12 items-center justify-center rounded-sm bg-gray-100 dark:bg-gray-800"
					>
						{index + 1}
					</li>
				{/each}
			</ul>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar class={scrollbar}>
		<ScrollArea.Thumb class="w-full rounded bg-gray-500 dark:bg-gray-400" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Scrollbar orientation="horizontal" class={scrollbar}>
		<ScrollArea.Thumb class="rounded bg-gray-500 dark:bg-gray-400" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>
```

### Gradient scroll fade

The viewport sets `--scroll-area-overflow-y-start` and `--scroll-area-overflow-y-end` to the distance in pixels from each edge. Use them in a `mask-image` to fade the content at an edge only while more content waits behind it. The fallback in `var(--scroll-area-overflow-y-end, 40px)` keeps the bottom fade on the server, before the viewport measures anything.

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root
	class="h-36 w-80 max-w-full rounded-md text-gray-900 outline outline-1 -outline-offset-1 outline-gray-200 dark:text-gray-100 dark:outline-gray-700"
>
	<ScrollArea.Viewport
		class="h-full rounded-md [mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%-min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%)] [mask-repeat:no-repeat]"
	>
		<ScrollArea.Content class="flex flex-col gap-4 py-6 pr-6 pl-4 text-sm leading-[1.375rem]">
			<p>The top fades in once you scroll down.</p>
			<p>The bottom fades out once you reach the end.</p>
			<p>Both fades follow the distance to each edge.</p>
			<p>Each fade is at most 40 pixels tall.</p>
			<p>The mask needs no JavaScript.</p>
			<p>It works with any content.</p>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar
		class="pointer-events-none m-1 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity duration-150 data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 dark:bg-gray-700"
	>
		<ScrollArea.Thumb class="w-full rounded bg-gray-500 dark:bg-gray-400" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
```

The overflow variables do not inherit. A child of the viewport that needs one must opt in with `inherit`:

```css
.child {
	--scroll-area-overflow-y-start: inherit;
	--scroll-area-overflow-y-end: inherit;
}
```

### Overflow edge attributes

The root, viewport, content, and scrollbar get `data-overflow-y-start`, `data-overflow-y-end`, `data-overflow-x-start`, and `data-overflow-x-end` while content waits behind that edge. Use them to show a shadow or a hint. Set `overflowEdgeThreshold` on the root to ignore the first pixels of overflow. Pass one number for every edge, or an object with `xStart`, `xEnd`, `yStart`, and `yEnd`.

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root
	overflowEdgeThreshold={{ yStart: 8, yEnd: 8 }}
	class="group relative h-36 w-80 max-w-full rounded-md text-gray-900 outline outline-1 -outline-offset-1 outline-gray-200 dark:text-gray-100 dark:outline-gray-700"
>
	<div
		class="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 rounded-t-md bg-gradient-to-b from-gray-900/15 to-transparent opacity-0 transition-opacity group-data-[overflow-y-start]:opacity-100 dark:from-white/15"
	></div>
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 rounded-b-md bg-gradient-to-t from-gray-900/15 to-transparent opacity-0 transition-opacity group-data-[overflow-y-end]:opacity-100 dark:from-white/15"
	></div>
	<ScrollArea.Viewport class="h-full rounded-md">
		<ScrollArea.Content class="flex flex-col gap-3 p-4 text-sm">
			{#each { length: 12 } as _, index (index)}
				<p>Line {index + 1}</p>
			{/each}
		</ScrollArea.Content>
	</ScrollArea.Viewport>
</ScrollArea.Root>
```

### Combine with Tabs

Render `Tabs.List` as a scroll viewport to scroll a long list of tabs. Pass a `render` snippet to the list, spread `props` onto `ScrollArea.Viewport`, and render `children` inside it.

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import { Tabs } from '@sveltery/base/tabs';

	const tab =
		'z-10 flex h-8 shrink-0 items-center px-3 text-sm font-medium whitespace-nowrap text-gray-600 outline-0 select-none hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[active]:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 dark:data-[active]:text-gray-100';
	const names = ['Overview', 'Projects', 'Account', 'Billing', 'Security', 'Notifications', 'Team'];
</script>

<Tabs.Root value="Overview" class="w-80 max-w-full text-gray-900 dark:text-gray-100">
	<ScrollArea.Root class="relative border-b border-gray-200 dark:border-gray-700">
		<Tabs.List>
			{#snippet render(props, state, children)}
				<ScrollArea.Viewport {...props} class="relative flex">
					{@render children?.()}
				</ScrollArea.Viewport>
			{/snippet}
			{#each names as name (name)}
				<Tabs.Tab value={name} class={tab}>{name}</Tabs.Tab>
			{/each}
			<Tabs.Indicator
				class="absolute bottom-0 left-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-gray-900 transition-all duration-200 dark:bg-gray-100"
			/>
		</Tabs.List>
	</ScrollArea.Root>
	{#each names as name (name)}
		<Tabs.Panel value={name} class="py-3 text-sm">{name} panel</Tabs.Panel>
	{/each}
</Tabs.Root>
```

## Differences from Base UI

- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- Handlers use Svelte's lowercase names, such as `onpointerdown` and `onscroll`. Call `event.preventDefault()` in a handler to skip the part's own handler.
- The root reads the reading direction from a [Direction Provider](/utils/direction-provider). Without a provider the direction is `ltr`. The root also passes a `dir` prop to its element.
- `ScrollArea.Root` renders the inline `<style>` element that hides the native scrollbars. A [CSP Provider](/utils/csp-provider) gives that element a `nonce`, and `disableStyleElements` removes it. Without the element, hide the native scrollbars yourself.
- The parts take no `ref`. Use `bind:this` or an attachment on a part's element through its `render` snippet.

## API reference

### Root

<ApiPart name="scroll-area" part="Root" />

| Attribute               | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `data-scrolling`        | Present while the user scrolls inside the scroll area.                          |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.                            |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.                           |
| `data-overflow-x-start` | Present when content waits behind the inline start edge of the horizontal axis. |
| `data-overflow-x-end`   | Present when content waits behind the inline end edge of the horizontal axis.   |
| `data-overflow-y-start` | Present when content waits behind the top edge.                                 |
| `data-overflow-y-end`   | Present when content waits behind the bottom edge.                              |

| CSS variable                  | Description               |
| ----------------------------- | ------------------------- |
| `--scroll-area-corner-height` | The height of the corner. |
| `--scroll-area-corner-width`  | The width of the corner.  |

### Viewport

<ApiPart name="scroll-area" part="Viewport" />

| Attribute               | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `data-scrolling`        | Present while the user scrolls inside the scroll area.                          |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.                            |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.                           |
| `data-overflow-x-start` | Present when content waits behind the inline start edge of the horizontal axis. |
| `data-overflow-x-end`   | Present when content waits behind the inline end edge of the horizontal axis.   |
| `data-overflow-y-start` | Present when content waits behind the top edge.                                 |
| `data-overflow-y-end`   | Present when content waits behind the bottom edge.                              |

| CSS variable                     | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `--scroll-area-overflow-x-start` | The distance in pixels from the inline start edge. |
| `--scroll-area-overflow-x-end`   | The distance in pixels from the inline end edge.   |
| `--scroll-area-overflow-y-start` | The distance in pixels from the top edge.          |
| `--scroll-area-overflow-y-end`   | The distance in pixels from the bottom edge.       |

### Content

<ApiPart name="scroll-area" part="Content" />

| Attribute               | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `data-scrolling`        | Present while the user scrolls inside the scroll area.                          |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.                            |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.                           |
| `data-overflow-x-start` | Present when content waits behind the inline start edge of the horizontal axis. |
| `data-overflow-x-end`   | Present when content waits behind the inline end edge of the horizontal axis.   |
| `data-overflow-y-start` | Present when content waits behind the top edge.                                 |
| `data-overflow-y-end`   | Present when content waits behind the bottom edge.                              |

### Scrollbar

<ApiPart name="scroll-area" part="Scrollbar" />

| Attribute               | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `data-orientation`      | `vertical` or `horizontal`.                                                     |
| `data-hovering`         | Present when the pointer is over the scroll area.                               |
| `data-scrolling`        | Present while the user scrolls along this scrollbar's axis.                     |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.                            |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.                           |
| `data-overflow-x-start` | Present when content waits behind the inline start edge of the horizontal axis. |
| `data-overflow-x-end`   | Present when content waits behind the inline end edge of the horizontal axis.   |
| `data-overflow-y-start` | Present when content waits behind the top edge.                                 |
| `data-overflow-y-end`   | Present when content waits behind the bottom edge.                              |

| CSS variable                 | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `--scroll-area-thumb-height` | The thumb's height. Set on a vertical scrollbar.  |
| `--scroll-area-thumb-width`  | The thumb's width. Set on a horizontal scrollbar. |

### Thumb

<ApiPart name="scroll-area" part="Thumb" />

| Attribute          | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `data-orientation` | `vertical` or `horizontal`.                             |
| `data-scrolling`   | Present while the user scrolls along this thumb's axis. |

### Corner

<ApiPart name="scroll-area" part="Corner" />

The corner sets no data attributes or CSS variables. It renders only when both scrollbars are visible.
