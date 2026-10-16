# Quick start

<Subtitle>
  A quick guide to getting started with Sveltery Base.
</Subtitle>

<Meta name="description" content="A quick guide to getting started with Sveltery Base." />

## Install the library

Install Sveltery Base using a package manager.

<InstallationBlock package="@sveltery/base" />

All components are included in a single package. Each component has its own entry point, such as `@sveltery/base/popover`, so your app bundle will contain only the components that you actually use.

## Set up

### Portals

Sveltery Base uses portals for components that render popups, such as Dialog and Popover.
To make portaled components always appear on top of the entire page, add the following style to your application layout root. In a SvelteKit app, that is the element that wraps `%sveltekit.body%` in `src/app.html`:

```html title="app.html"
<body>
	<div class="root">%sveltekit.body%</div>
</body>
```

```css title="styles.css"
.root {
	isolation: isolate;
}
```

The SvelteKit template gives that element `style="display: contents"`. Remove it, because an element with `display: contents` cannot create a stacking context.

This style creates a separate stacking context for your application's `.root` element.
This way, popups always appear above the page contents, and any `z-index` property in your styles won't interfere with them.

### iOS 26+ Safari

Starting with iOS 26, Safari allows content beneath the UI chrome to be visible. Backdrops such as those used by dialogs must use `position: absolute` instead of `position: fixed` to cover the entire visual viewport. For this to work after the page is scrolled, the following style must be added to your global styles:

```css title="styles.css"
body {
	position: relative;
}
```

## Assemble a component

This demo shows you how to import a [Popover](/components/popover) component, assemble its parts, and apply styles.
There are examples for both Tailwind CSS and plain CSS below, but since Sveltery Base is unstyled, you can use CSS-in-JS, CSS Modules, or any other styling solution you prefer.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const triggerClass =
		'flex h-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm font-normal whitespace-nowrap text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 data-pressed:bg-neutral-100 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Popover.Root>
	<Popover.Trigger class={triggerClass}>Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="relative flex h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[500px] flex-col gap-1 origin-[var(--transform-origin)] bg-white dark:bg-neutral-950 p-3 text-neutral-950 dark:text-white outline-none border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<Popover.Arrow
					class="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]"
				/>
				<Popover.Title class="text-sm font-bold">Notifications</Popover.Title>
				<Popover.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

The same popover with plain CSS. The popup is portaled to `<body>`, outside your component's markup, so the rules in a `<style>` block use `:global`:

```svelte title="index.svelte"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger class="Button">Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup class="Popup">
				<Popover.Arrow class="Arrow" />
				<Popover.Title class="Title">Notifications</Popover.Title>
				<Popover.Description class="Description">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>

<style>
	:global(.Popup) {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem;
		outline: none;
		border: 1px solid oklch(14.5% 0 0deg);
		background-color: white;
		color: oklch(14.5% 0 0deg);
		box-shadow: 0.25rem 0.25rem 0 rgb(0 0 0 / 12%);
		transform-origin: var(--transform-origin);
		transition:
			transform 100ms ease-out,
			opacity 100ms ease-out;
		width: var(--popup-width, auto);
		height: var(--popup-height, auto);
		max-width: 500px;
	}

	:global(.Popup[data-starting-style]),
	:global(.Popup[data-ending-style]) {
		opacity: 0;
		transform: scale(0.98);
	}

	:global(.Title) {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 700;
	}

	:global(.Description) {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: oklch(43.9% 0 0deg);
	}

	/* .Button and .Arrow styles */
</style>
```

## Pre-styled components

[Sveltery UI](https://ui.sveltery.dev) is a great place to start if you need pre-styled components with higher-level abstractions. It uses Sveltery Base as its unstyled foundation.

Take a look at the [Community](/overview/community) page to see more of the Sveltery Base ecosystem.

## Working with LLMs

For those of you working with LLMs, each docs page has a "View as Markdown" link at the top, which can be shared with AI chat assistants to help them understand Sveltery Base concepts and component APIs.

Additionally, there is an ["llms.txt"](/llms.txt) link in the "Handbook" section of the navigation sidebar, which you can feed to AI chat assistants to help them navigate the docs.

## Next steps

This walkthrough outlines the basics of putting together a Sveltery Base component.
Continue to the [Handbook](/handbook/styling) section for broader guidance on topics like styling, animation, and composition, or explore the [components](/components/accordion).
