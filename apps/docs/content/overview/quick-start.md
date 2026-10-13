---
title: Quick start
description: A quick guide to getting started with Sveltery Base.
order: 1
---

## Install the library

Sveltery Base is not published to npm yet. Install it from its GitHub repository with pnpm:

```bash
pnpm add github:sveltery/base
```

The repository holds the source, not the built package. pnpm builds the package after it downloads it, and pnpm blocks that build by default. The first install stops with `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` and prints an `allowBuilds` entry for the commit it downloaded. Add that entry to the `pnpm-workspace.yaml` file of your project, then run the same command again:

```yaml
allowBuilds:
  '@sveltery/base@https://codeload.github.com/sveltery/base/tar.gz/<commit>': true
```

The entry names one commit, so pnpm asks again when you install a newer commit. The package needs Svelte 5.57.1 or later as a peer dependency.

Every component is in the same package. Import each component from its own entry point, such as `@sveltery/base/popover`, so your bundle contains only the components you use.

## Set up

### Portals

Dialog and Popover render their popups in a portal. By default, the portal is appended to `<body>`.

To make portaled popups always appear above the page, give the root element of your application its own stacking context. In a SvelteKit app, put a class on the element that wraps `%sveltekit.body%` in `src/app.html`:

```html
<body>
	<div class="root">%sveltekit.body%</div>
</body>
```

The SvelteKit template gives that element `style="display: contents"`. Remove it, because an element with `display: contents` has no box and cannot create a stacking context. Then add this rule to your global stylesheet:

```css
.root {
	isolation: isolate;
}
```

The `.root` element now creates a separate stacking context. Popups appear above the page content, and a `z-index` inside your app does not compete with them.

### iOS 26+ Safari

Starting with iOS 26, Safari shows the page content under its browser controls. A backdrop, such as `Dialog.Backdrop`, must use `position: absolute` instead of `position: fixed` to cover the whole visual viewport. For an absolute backdrop to cover the viewport after the page scrolls, add this rule to your global stylesheet:

```css
body {
	position: relative;
}
```

## Assemble a component

This demo imports [Popover](/components/popover), assembles its parts, and styles them with Tailwind CSS:

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:data-[popup-open]:bg-gray-700"
	>
		Notifications
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="flex max-w-[500px] origin-[var(--transform-origin)] flex-col gap-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-lg shadow-gray-200 outline-none transition-[transform,scale,opacity] duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none"
			>
				<Popover.Title class="text-sm font-medium">Notifications</Popover.Title>
				<Popover.Description class="text-sm text-gray-600 dark:text-gray-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

Sveltery Base renders no styles of its own. Each part takes a `class` and a `style` string, and sets data attributes such as `data-popup-open` and `data-starting-style` that you can style. You can use Tailwind CSS, plain CSS, or any other way of writing CSS.

The same popover with plain CSS uses `:global` selectors. The popup is rendered by the Popover component and portaled to `<body>`, so a scoped selector in your component does not reach it:

```svelte
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger>Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup class="Popup">
				<Popover.Title>Notifications</Popover.Title>
				<Popover.Description>You are all caught up. Good job!</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>

<style>
	:global(.Popup) {
		padding: 0.75rem 1rem;
		border: 1px solid #e5e7eb;
		background-color: white;
		transform-origin: var(--transform-origin);
		transition:
			transform 150ms,
			opacity 150ms;
	}

	:global(.Popup[data-starting-style]),
	:global(.Popup[data-ending-style]) {
		opacity: 0;
		transform: scale(0.9);
	}
</style>
```

## Next steps

- [Styling](/handbook/styling) covers data attributes, `class` values, CSS variables, and the state that a `render` snippet receives.
- [Animation](/handbook/animation) explains how parts animate in and out.
- [Composition](/handbook/composition) shows how to replace the element a part renders.
- [Forms](/handbook/forms) and [SvelteKit](/handbook/sveltekit) cover forms, validation, and server rendering.
