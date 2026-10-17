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

<script>
	import { DemoPopoverHero } from '../../components/popover/demos/hero';
</script>

<DemoPopoverHero />

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
