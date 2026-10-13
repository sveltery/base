---
title: Navigation Menu
description: A collection of links and menus for website navigation.
---

```svelte demo
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';

	const trigger =
		'flex h-8 items-center justify-center gap-1.5 bg-transparent px-3 text-sm text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-900 data-[popup-open]:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:outline-gray-100 dark:data-[popup-open]:bg-gray-800';
	const content =
		'h-full w-max max-w-[400px] p-2 transition-[opacity,translate] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[starting-style]:data-[activation-direction=left]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=right]:translate-x-1/2 data-[ending-style]:data-[activation-direction=left]:translate-x-1/2 data-[ending-style]:data-[activation-direction=right]:-translate-x-1/2';
	const card =
		'block p-2 text-gray-900 no-underline hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:outline-gray-100';

	const overview = [
		{
			href: '#quick-start',
			title: 'Quick Start',
			text: 'Install and assemble your first component.'
		},
		{ href: '#accessibility', title: 'Accessibility', text: 'How the components stay accessible.' },
		{ href: '#releases', title: 'Releases', text: 'What changed in the latest versions.' },
		{ href: '#about', title: 'About', text: 'The project and its goals.' }
	];
	const handbook = [
		{
			href: '#styling',
			title: 'Styling',
			text: 'Style parts with CSS, Tailwind or any other tool.'
		},
		{ href: '#animation', title: 'Animation', text: 'Animate with CSS transitions or animations.' },
		{ href: '#composition', title: 'Composition', text: 'Replace parts with your own elements.' }
	];
</script>

{#snippet caret()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet links(items: { href: string; title: string; text: string }[], grid: boolean)}
	<ul class={['m-0 list-none p-0', grid ? 'grid grid-cols-2' : 'flex flex-col']}>
		{#each items as item (item.href)}
			<li>
				<NavigationMenu.Link href={item.href} class={card}>
					<span class="mb-1 block text-sm">{item.title}</span>
					<span class="block text-sm text-gray-600 dark:text-gray-400">{item.text}</span>
				</NavigationMenu.Link>
			</li>
		{/each}
	</ul>
{/snippet}

<NavigationMenu.Root class="min-w-max">
	<NavigationMenu.List class="relative m-0 flex list-none gap-px p-0">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={trigger}>
				Overview
				<NavigationMenu.Icon class="transition-transform duration-200 data-[popup-open]:rotate-180">
					{@render caret()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>
			<NavigationMenu.Content class={content}
				>{@render links(overview, true)}</NavigationMenu.Content
			>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={trigger}>
				Handbook
				<NavigationMenu.Icon class="transition-transform duration-200 data-[popup-open]:rotate-180">
					{@render caret()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>
			<NavigationMenu.Content class={content}
				>{@render links(handbook, false)}</NavigationMenu.Content
			>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Link href="https://github.com/sveltery/base" class={trigger}>
				GitHub
			</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner
			sideOffset={10}
			collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
			collisionAvoidance={{ side: 'none' }}
			class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] data-[instant]:transition-none"
			style="--duration: 0.35s; --easing: cubic-bezier(0.22, 1, 0.36, 1)"
		>
			<NavigationMenu.Popup
				class="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] rounded-lg bg-gray-50 text-gray-900 shadow-lg outline outline-gray-200 transition-[opacity,scale,width,height] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<NavigationMenu.Arrow
					class="flex transition-[left] duration-[var(--duration)] ease-[var(--easing)] data-[side=bottom]:-top-2 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
				>
					<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
						<path
							d="M0 10L10 1L20 10"
							class="fill-gray-50 stroke-gray-200 dark:fill-gray-900 dark:stroke-gray-700"
						/>
					</svg>
				</NavigationMenu.Arrow>
				<NavigationMenu.Viewport class="relative h-full w-full overflow-hidden" />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>
				<NavigationMenu.Icon />
			</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link />
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Backdrop />
		<NavigationMenu.Positioner>
			<NavigationMenu.Popup>
				<NavigationMenu.Arrow />
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

`NavigationMenu.Backdrop`, `NavigationMenu.Arrow`, and `NavigationMenu.Icon` are optional. The content of the active item shows in `NavigationMenu.Viewport`. An item without a trigger can hold a `NavigationMenu.Link` directly, as the GitHub link above does.

## Examples

### Open item

Bind `value` to read and change which item is open. Give each `NavigationMenu.Item` a `value`. Without one, the item gets a generated value. A nullish `value` closes the menu. The `onValueChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';

	let value = $state<string | null>(null);
	let reason = $state('none yet');

	const trigger =
		'h-8 px-3 text-sm text-gray-900 hover:bg-gray-100 data-[popup-open]:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800';
	const link = 'block px-2 py-1 text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<div class="flex gap-2">
		<button type="button" class="rounded border px-2 py-1" onclick={() => (value = 'guides')}>
			Open guides
		</button>
		<button type="button" class="rounded border px-2 py-1" onclick={() => (value = null)}>
			Close
		</button>
	</div>
	<p>Open item: {value ?? 'none'}. Last change reason: {reason}</p>
	<NavigationMenu.Root bind:value onValueChange={(_value, details) => (reason = details.reason)}>
		<NavigationMenu.List class="m-0 flex list-none gap-1 p-0">
			<NavigationMenu.Item value="guides">
				<NavigationMenu.Trigger class={trigger}>Guides</NavigationMenu.Trigger>
				<NavigationMenu.Content class="p-2">
					<NavigationMenu.Link href="#install" class={link} closeOnClick
						>Install</NavigationMenu.Link
					>
					<NavigationMenu.Link href="#theming" class={link} closeOnClick
						>Theming</NavigationMenu.Link
					>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="reference">
				<NavigationMenu.Trigger class={trigger}>Reference</NavigationMenu.Trigger>
				<NavigationMenu.Content class="p-2">
					<NavigationMenu.Link href="#api" class={link} closeOnClick>API</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		<NavigationMenu.Portal>
			<NavigationMenu.Positioner sideOffset={8}>
				<NavigationMenu.Popup
					class="h-[var(--popup-height)] w-[var(--popup-width)] rounded-lg bg-gray-50 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
				>
					<NavigationMenu.Viewport />
				</NavigationMenu.Popup>
			</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
</div>
```

The `reason` in the event details is one of `trigger-press`, `trigger-hover`, `outside-press`, `list-navigation`, `focus-out`, `escape-key`, `link-press`, `imperative-action`, or `none`. Set `closeOnClick` on a link to close the menu when the link is clicked, with the reason `link-press`.

### Delay and close delay

Set `delay` on the root for the wait before an item opens on hover, and `closeDelay` for the wait before the menu closes after the pointer leaves. Both are in milliseconds and default to 50.

### Nested inline submenus

Put a `NavigationMenu.Root` inside a `NavigationMenu.Content` to build a second level. Leave out the nested `NavigationMenu.Portal` and render only a `NavigationMenu.List` and a `NavigationMenu.Viewport`, so the second level stays in the same panel. Pass an initial `value` to show one submenu at once.

```svelte demo
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';

	const trigger =
		'h-8 px-3 text-left text-sm text-gray-900 hover:bg-gray-100 data-[popup-open]:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800';
	const link = 'block px-2 py-1 text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List class="m-0 flex list-none gap-1 p-0">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={trigger}>Product</NavigationMenu.Trigger>
			<NavigationMenu.Content class="p-2">
				<NavigationMenu.Root value="developers" orientation="vertical" class="flex gap-4">
					<NavigationMenu.List class="m-0 flex list-none flex-col p-0">
						<NavigationMenu.Item value="developers">
							<NavigationMenu.Trigger class={trigger}>Developers</NavigationMenu.Trigger>
							<NavigationMenu.Content>
								<NavigationMenu.Link href="#get-started" class={link}
									>Get started</NavigationMenu.Link
								>
								<NavigationMenu.Link href="#composition" class={link}
									>Composition</NavigationMenu.Link
								>
							</NavigationMenu.Content>
						</NavigationMenu.Item>
						<NavigationMenu.Item value="design">
							<NavigationMenu.Trigger class={trigger}>Design systems</NavigationMenu.Trigger>
							<NavigationMenu.Content>
								<NavigationMenu.Link href="#styling" class={link}>Styling</NavigationMenu.Link>
								<NavigationMenu.Link href="#accessibility" class={link}
									>Accessibility</NavigationMenu.Link
								>
							</NavigationMenu.Content>
						</NavigationMenu.Item>
					</NavigationMenu.List>
					<NavigationMenu.Viewport class="min-w-40" />
				</NavigationMenu.Root>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>
	<NavigationMenu.Portal>
		<NavigationMenu.Positioner sideOffset={8}>
			<NavigationMenu.Popup
				class="h-[var(--popup-height)] w-[var(--popup-width)] rounded-lg bg-gray-50 shadow-lg outline outline-gray-200 dark:bg-gray-900 dark:outline-gray-700"
			>
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

A nested root with its own `NavigationMenu.Portal` opens its submenu in a separate popup instead. A `NavigationMenu.Link` with `closeOnClick` at any level closes every level.

### Custom links

Pass a `render` snippet to `NavigationMenu.Link` to render your own link element, such as one that your router handles. Spread the props the snippet receives onto that element.

### Closing animations

The popup stays mounted until its closing animation finishes. To animate the close with JavaScript, call `eventDetails.preventUnmountOnClose()` in `onValueChange` when the value becomes `null`. Then call `unmount()` on the root, read through `bind:this`, when your animation ends. Call the root's `close()` to close the menu from code, so `onValueChange` still runs.

## Differences from Base UI

- `value` is a bindable prop. Use `bind:value` instead of `value` and `defaultValue`. There is no `defaultValue` prop. A value passed without `bind:` is the initial value.
- `actionsRef` is not available. Use `bind:this` on `NavigationMenu.Root`, which exposes `close()` and `unmount()`.
- The `NavigationMenu*DataAttributes` and `NavigationMenu*CssVars` namespaces are not exported. Use the attribute and variable names in this page.
- `NavigationMenu.Content` stays in the component tree of its item. While the item is active, the element moves into the viewport. Base UI renders it there through a React portal. Events from the content bubble through the viewport and the popup, as the DOM places it.
- The size variables are part of each element's `style`. A `style` you pass merges with them.

## API reference

### Root

<ApiPart name="navigation-menu" part="Root" />

A nested root renders a `<div>` instead of a `<nav>`.

### List

<ApiPart name="navigation-menu" part="List" />

| Attribute   | Description                    |
| ----------- | ------------------------------ |
| `data-open` | Present when the menu is open. |

### Item

<ApiPart name="navigation-menu" part="Item" />

### Trigger

<ApiPart name="navigation-menu" part="Trigger" />

| Attribute         | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `data-popup-open` | Present when the menu is open and this item is active. |
| `data-pressed`    | Present when the menu is open and this item is active. |
| `data-disabled`   | Present when the trigger is disabled.                  |

### Icon

<ApiPart name="navigation-menu" part="Icon" />

| Attribute         | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `data-popup-open` | Present when the menu is open and this item is active. |

### Content

<ApiPart name="navigation-menu" part="Content" />

| Attribute                   | Description                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `data-open`                 | Present when this content is open.                                                 |
| `data-closed`               | Present when this content is closed.                                               |
| `data-activation-direction` | `left`, `right`, `up` or `down`: where the new trigger sits from the previous one. |
| `data-starting-style`       | Present when the content is animating in.                                          |
| `data-ending-style`         | Present when the content is animating out.                                         |

### Link

<ApiPart name="navigation-menu" part="Link" />

| Attribute     | Description                                |
| ------------- | ------------------------------------------ |
| `data-active` | Present when the link is the current page. |

### Portal

<ApiPart name="navigation-menu" part="Portal" />

### Backdrop

<ApiPart name="navigation-menu" part="Backdrop" />

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-open`           | Present when the menu is open.           |
| `data-closed`         | Present when the menu is closed.         |
| `data-starting-style` | Present when the popup is animating in.  |
| `data-ending-style`   | Present when the popup is animating out. |

### Positioner

<ApiPart name="navigation-menu" part="Positioner" />

Without props, the positioner places the popup below the active trigger and centers it. `side` defaults to `bottom`, `align` to `center`, `collisionPadding` to `5`, and `arrowPadding` to `5`. `positionMethod` defaults to `absolute`.

| Attribute            | Description                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `data-open`          | Present when the menu is open.                                                                          |
| `data-closed`        | Present when the menu is closed.                                                                        |
| `data-anchor-hidden` | Present when the active trigger is hidden.                                                              |
| `data-side`          | The side of the trigger the popup is on after collisions.                                               |
| `data-align`         | How the popup lines up with the trigger after collisions.                                               |
| `data-instant`       | Present when the positioner skips its transition, such as on the first frame or during a window resize. |

| CSS variable          | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `--anchor-width`      | The width of the active trigger.                             |
| `--anchor-height`     | The height of the active trigger.                            |
| `--available-width`   | The width between the trigger and the edge of the boundary.  |
| `--available-height`  | The height between the trigger and the edge of the boundary. |
| `--positioner-width`  | The fixed width of the positioner, from the active content.  |
| `--positioner-height` | The fixed height of the positioner, from the active content. |
| `--transform-origin`  | The point on the popup the trigger is closest to.            |

### Popup

<ApiPart name="navigation-menu" part="Popup" />

| Attribute             | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `data-open`           | Present when the menu is open.                            |
| `data-closed`         | Present when the menu is closed.                          |
| `data-side`           | The side of the trigger the popup is on after collisions. |
| `data-align`          | How the popup lines up with the trigger after collisions. |
| `data-starting-style` | Present when the popup is animating in.                   |
| `data-ending-style`   | Present when the popup is animating out.                  |

| CSS variable     | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `--popup-width`  | The width of the popup: fixed while the size animates, `auto` after it.  |
| `--popup-height` | The height of the popup: fixed while the size animates, `auto` after it. |

### Arrow

<ApiPart name="navigation-menu" part="Arrow" />

| Attribute         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `data-open`       | Present when the menu is open.                                    |
| `data-closed`     | Present when the menu is closed.                                  |
| `data-side`       | The side of the trigger the popup is on after collisions.         |
| `data-align`      | How the popup lines up with the trigger after collisions.         |
| `data-uncentered` | Present when the arrow cannot point at the center of the trigger. |

### Viewport

<ApiPart name="navigation-menu" part="Viewport" />
