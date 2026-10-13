---
title: Animation
description: A guide to animating Sveltery Base components.
order: 2
---

You can animate the components with CSS transitions, CSS animations, Svelte transitions, or the Web Animations API. Each component sets data attributes for its states, and a few attributes exist only for animation.

## CSS transitions

Use these attributes to transition a part as it appears and disappears:

- `[data-starting-style]` is the style to transition from when the part appears. It is present for the first frame after the part mounts or opens.
- `[data-ending-style]` is the style to transition to when the part disappears. It is present from the moment the part starts to close until it unmounts.

Prefer transitions to CSS animations. A transition can reverse midway. If the user closes a popup before it finishes opening, the popup animates back to its closed state with no jump.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
	>
		Transition
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="origin-[var(--transform-origin)] rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg shadow-gray-200 transition-[scale,opacity] duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none"
			>
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

The same transition in plain CSS:

```css
.Popup {
	transform-origin: var(--transform-origin);
	transition:
		transform 150ms,
		opacity 150ms;
}

.Popup[data-starting-style],
.Popup[data-ending-style] {
	opacity: 0;
	transform: scale(0.9);
}
```

## CSS animations

Use these attributes to run a CSS animation as a part appears and disappears:

- `[data-open]` is present while the part is open. Start the enter animation from it.
- `[data-closed]` is present once the part starts to close. Start the exit animation from it.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
	>
		Animation
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="AnimatedPopup rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg shadow-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none"
			>
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>

<style>
	@keyframes -global-scale-in {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
	}

	@keyframes -global-scale-out {
		to {
			opacity: 0;
			transform: scale(0.9);
		}
	}

	:global(.AnimatedPopup) {
		transform-origin: var(--transform-origin);
	}

	:global(.AnimatedPopup[data-open]) {
		animation: scale-in 250ms ease-out;
	}

	:global(.AnimatedPopup[data-closed]) {
		animation: scale-out 250ms ease-in;
	}
</style>
```

Svelte scopes `@keyframes` names to the component. The popup is not in your component's markup, so the `-global-` prefix keeps each keyframes name global, and the `:global` rules can refer to it. A global stylesheet needs neither.

## Svelte transitions

A Svelte transition can animate an element that you render with a `render` snippet. Add the `|global` modifier. The part adds and removes your element inside its own `{#if}` block, and a transition without `|global` plays only when the block that holds the directive is added or removed.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import { scale } from 'svelte/transition';
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
	>
		Svelte transition
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg shadow-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none"
			>
				{#snippet render(props, state, children)}
					<div {...props} transition:scale|global={{ start: 0.9, duration: 200 }}>
						{@render children?.()}
					</div>
				{/snippet}
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

Do not combine a Svelte transition with `data-starting-style` or `data-ending-style` styles on the same element. Both animate the same properties.

## Waiting for exit animations

When a part closes, it keeps its element in the DOM until the animations on that element finish. The part reads them with `element.getAnimations()`, which returns the CSS transitions, CSS animations, and Web Animations running on that element. Animations on a child element are not included, so animate the part's own element. If an animation is canceled and another one replaces it, the part waits for the new one.

These parts wait for their exit animations before they unmount or hide:

| Part                                       | Waits for animations on |
| ------------------------------------------ | ----------------------- |
| `Dialog.Popup`                             | the popup               |
| `Popover.Popup`                            | the popup               |
| `Collapsible.Panel` and `Accordion.Panel`  | the panel               |
| `Tabs.Panel`                               | the panel               |
| `Checkbox.Indicator` and `Radio.Indicator` | the indicator           |
| `Avatar.Image`                             | the image               |
| `Field.Error`                              | the error message       |

A Dialog or Popover removes all of its portaled parts, the backdrop included, once the popup's animations finish. Give the backdrop an exit animation no longer than the popup's, or it is cut off.

`Dialog.Root` and `Popover.Root` call `onOpenChangeComplete` with the new open state once the popup's open or close animations finish.

## Manual unmounting

Sometimes the part cannot detect when the close is done. For example, the animation runs on a child element, or the popup must wait for something that is not an animation. End the closing phase yourself:

1. In `onOpenChange`, call `eventDetails.preventUnmountOnClose()` when the popup closes.
2. When your animation finishes, call `unmount()` on the root. Read the root with `bind:this`.

```svelte
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	let root = $state<ReturnType<typeof Popover.Root>>();
	let content = $state<HTMLElement | null>(null);

	async function animateOut() {
		await content?.animate({ opacity: [1, 0] }, 200).finished;
		root?.unmount();
	}
</script>

<Popover.Root
	bind:this={root}
	onOpenChange={(open, eventDetails) => {
		if (open) return;
		eventDetails.preventUnmountOnClose();
		animateOut();
	}}
>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>
				<div bind:this={content}>Popup</div>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

`unmount()` ends the closing phase, and `onOpenChangeComplete(false)` runs. With `keepMounted` on the portal, the popup stays in the DOM and is hidden instead of removed. `Dialog.Root` has the same `unmount()` method. Base UI uses an `actionsRef` prop for this method. Sveltery Base uses `bind:this`.
