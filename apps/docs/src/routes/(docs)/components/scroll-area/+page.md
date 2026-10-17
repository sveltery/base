# Scroll Area

<Subtitle>
  A native scroll container with custom scrollbars.
</Subtitle>

<Meta name="description" content="A native scroll container with custom scrollbars." />

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root class="h-[8.5rem] w-96 max-w-[calc(100vw-8rem)] bg-white dark:bg-neutral-950">
	<ScrollArea.Viewport
		class="h-full border border-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:focus-visible:outline-white"
	>
		<ScrollArea.Content
			class="flex flex-col gap-4 py-2 pr-5 pl-3 text-sm leading-[1.375rem] text-neutral-950 dark:text-white"
		>
			<p>
				Vernacular architecture is building done outside any academic tradition, and without
				professional guidance. It is not a particular architectural movement or style, but rather a
				broad category, encompassing a wide range and variety of building types, with differing
				methods of construction, from around the world, both historical and extant and classical and
				modern. Vernacular architecture constitutes 95% of the world's built environment, as
				estimated in 1995 by Amos Rapoport, as measured against the small percentage of new
				buildings every year designed by architects and built by engineers.
			</p>
			<p>
				This type of architecture usually serves immediate, local needs, is constrained by the
				materials available in its particular region and reflects local traditions and cultural
				practices. The study of vernacular architecture does not examine formally schooled
				architects, but instead that of the design skills and tradition of local builders, who were
				rarely given any attribution for the work. More recently, vernacular architecture has been
				examined by designers and the building industry in an effort to be more energy conscious
				with contemporary design and construction—part of a broader interest in sustainable design.
			</p>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar
		class="pointer-events-none m-px flex w-4 justify-center bg-black/12 opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 dark:bg-white/12"
	>
		<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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

Use `<ScrollArea.Corner>` to prevent the scrollbars from intersecting.

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root class="h-80 w-80 max-w-[calc(100vw-8rem)]">
	<ScrollArea.Viewport
		class="h-full border border-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:focus-visible:outline-white"
	>
		<ScrollArea.Content class="pt-3 pr-6 pb-6 pl-3">
			<ul
				class="m-0 grid list-none grid-cols-[repeat(10,6.25rem)] grid-rows-[repeat(10,6.25rem)] gap-3 p-0"
			>
				{#each Array.from({ length: 100 }, (_, i) => i + 1) as n (n)}
					<li
						class="flex items-center justify-center bg-neutral-200 text-sm font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
					>
						{n}
					</li>
				{/each}
			</ul>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar
		class="relative m-px flex bg-black/12 dark:bg-white/12 opacity-0 transition-opacity pointer-events-none data-[orientation=vertical]:w-4 data-[orientation=horizontal]:h-4 data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
	>
		<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Scrollbar
		class="relative m-px flex bg-black/12 dark:bg-white/12 opacity-0 transition-opacity pointer-events-none data-[orientation=vertical]:w-4 data-[orientation=horizontal]:h-4 data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
		orientation="horizontal"
	>
		<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>
```

### Gradient scroll fade

Use the viewport overflow CSS variables to drive a CSS mask, which gradually increases the fade as the user scrolls away from the edges.

```css title="scroll-area.module.css"
.Viewport {
	mask-image: linear-gradient(
		to bottom,
		transparent 0,
		black min(40px, var(--scroll-area-overflow-y-start)),
		black calc(100% - min(40px, var(--scroll-area-overflow-y-end, 40px))),
		transparent 100%
	);
	mask-repeat: no-repeat;
}
```

For SSR, a fallback can be used as part of the end-side `var()` call so the mask is visible before the overflow CSS variables hydrate.

```css title="SSR fallback"
/* @highlight-text ", 40px" */
var(--scroll-area-overflow-y-end, 40px);
```

When the fade is applied to `<ScrollArea.Viewport>` itself, the variables can be used directly. However, inheritance to children is disabled, so they must explicitly opt-in using the `inherit` keyword.

```css title="Child element opt-in"
.Child {
	--scroll-area-overflow-y-start: inherit;
	--scroll-area-overflow-y-end: inherit;
}
```

```svelte demo
<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root
	class="h-48 w-96 max-w-[calc(100vw-8rem)] bg-neutral-100 has-[>_:first-child:focus-visible]:outline-2 has-[>_:first-child:focus-visible]:outline-offset-0 has-[>_:first-child:focus-visible]:outline-neutral-950 dark:bg-neutral-800 dark:has-[>_:first-child:focus-visible]:outline-white"
>
	<ScrollArea.Viewport
		class="h-full mask-linear-[to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%] bg-neutral-100 mask-no-repeat outline-none dark:bg-neutral-800"
	>
		<ScrollArea.Content
			class="flex flex-col gap-4 py-2 pr-5 pl-3 text-sm leading-[1.375rem] text-neutral-950 dark:text-white"
		>
			<p>
				Vernacular architecture is building done outside any academic tradition, and without
				professional guidance. It is not a particular architectural movement or style, but rather a
				broad category, encompassing a wide range and variety of building types, with differing
				methods of construction, from around the world, both historical and extant and classical and
				modern. Vernacular architecture constitutes 95% of the world's built environment, as
				estimated in 1995 by Amos Rapoport, as measured against the small percentage of new
				buildings every year designed by architects and built by engineers.
			</p>
			<p>
				This type of architecture usually serves immediate, local needs, is constrained by the
				materials available in its particular region and reflects local traditions and cultural
				practices. The study of vernacular architecture does not examine formally schooled
				architects, but instead that of the design skills and tradition of local builders, who were
				rarely given any attribution for the work. More recently, vernacular architecture has been
				examined by designers and the building industry in an effort to be more energy conscious
				with contemporary design and construction—part of a broader interest in sustainable design.
			</p>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar
		class="pointer-events-none m-px flex w-4 justify-center bg-black/8 opacity-0 transition-opacity duration-150 data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 dark:bg-white/12"
	>
		<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
```

### Combining with Tabs

Use `<Tabs.List>`'s `render` snippet to render `<ScrollArea.Viewport>` directly when the tab list itself needs the viewport overflow values for a mask fade. This keeps the mask logic on the same element that receives the scroll state.

```svelte title="Tabs with ScrollArea"
<Tabs.Root value="overview">
	<ScrollArea.Root>
		<!-- @highlight-start -->
		<Tabs.List>
			{#snippet render(props, state, children)}
				<ScrollArea.Viewport {...props}>{@render children?.()}</ScrollArea.Viewport>
			{/snippet}
			<!-- @highlight-end -->
			<Tabs.Tab value="overview">Overview</Tabs.Tab>
			<Tabs.Indicator />
		</Tabs.List>
	</ScrollArea.Root>
	<Tabs.Panel value="overview">...</Tabs.Panel>
</Tabs.Root>
```

## API reference

<script>
	import { TypesScrollArea } from './types';
</script>

### Root

<TypesScrollArea.Root />

### Viewport

<TypesScrollArea.Viewport />

### Content

<TypesScrollArea.Content />

### Scrollbar

<TypesScrollArea.Scrollbar />

### Thumb

<TypesScrollArea.Thumb />

### Corner

<TypesScrollArea.Corner />
