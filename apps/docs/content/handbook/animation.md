---
title: Animation
description: A guide to animating Sveltery Base components.
order: 2
---

Sveltery Base components can be animated using CSS transitions, CSS animations, or JavaScript animations. Each component provides a number of data attributes to target its states, as well as a few attributes specifically for animation.

## CSS transitions

Use the following Sveltery Base attributes for creating transitions when a component becomes visible or hidden:

- `[data-starting-style]` corresponds to the initial style to transition from.
- `[data-ending-style]` corresponds to the final style to transition to.

Transitions are recommended over CSS animations, because a transition can be smoothly cancelled midway.
For example, if the user closes a popup before it finishes opening, with CSS transitions it will smoothly animate to its closed state without any abrupt changes.

```css title="popover.css"
.Popup {
	box-sizing: border-box;
	padding: 1rem 1.5rem;
	background-color: canvas;
	transform-origin: var(--transform-origin);
	transition:
		transform 150ms,
		opacity 150ms;

	/* @highlight-start */
	&[data-starting-style],
	&[data-ending-style] {
		opacity: 0;
		transform: scale(0.9);
	}
	/* @highlight-end */
}
```

## CSS animations

Use the following Sveltery Base attributes for creating CSS animations when a component becomes visible or hidden:

- `[data-open]` corresponds to the style applied when a component becomes visible.
- `[data-closed]` corresponds to the style applied before a component becomes hidden.

```css title="popover.css"
@keyframes scaleIn {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

@keyframes scaleOut {
	from {
		opacity: 1;
		transform: scale(1);
	}
	to {
		opacity: 0;
		transform: scale(0.9);
	}
}

.Popup[data-open] {
	animation: scaleIn 250ms ease-out;
}

.Popup[data-closed] {
	animation: scaleOut 250ms ease-in;
}
```

In a Svelte `<style>` block, name the keyframes `-global-scaleIn` and `-global-scaleOut`, and wrap the selectors in `:global(...)`, because the popup is not part of your component's markup.

## JavaScript animations

JavaScript animations, such as [Svelte transitions](https://svelte.dev/docs/svelte/transition) and the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), need the popup to stay rendered while its exit animation plays, and Sveltery Base to know when that animation is over.

When a popup closes, `open` becomes `false` right away, but the popup stays rendered in a closing phase until its closing animation finishes.
Sveltery Base detects animations on the popup element with `element.getAnimations()`. CSS transitions, CSS animations, and animations started with `element.animate()` are always detected.
Once the animation ends, the popup is removed from the DOM, or hidden if the `Portal` has `keepMounted`, and `onOpenChangeComplete(false)` fires.

This leaves two choices:

- **Where does the popup go when closed?** Removed from the DOM, with a Svelte transition that plays as it leaves, or kept in the DOM with `keepMounted`.
- **Who ends the closing phase?** Sveltery Base, when it can detect the animation, or you, with [manual unmounting](#manual-unmounting).

### Animating components unmounted from DOM when closed with Svelte transitions

Most popup components like Popover, Dialog, Tooltip, and Menu are removed from the DOM when they are closed by default. To animate them with a Svelte transition:

- Use the `render` snippet to render the `Popup` element yourself
- Add a transition to that element with the `|global` modifier, so it plays when the part removes the element from its own `{#if}` block

Svelte keeps the element in the DOM until its outro finishes, so the popup doesn't need `keepMounted` or a bound `open` state.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import { scale } from 'svelte/transition';
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-8 items-center justify-center border border-neutral-950 bg-white px-3 text-sm font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white"
	>
		Trigger
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="box-border max-w-[500px] origin-[var(--transform-origin)] border border-neutral-950 bg-white px-4 py-3 text-sm text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				{#snippet render(props, state, children)}
					<div {...props} transition:scale|global={{ start: 0.8, duration: 200 }}>
						{@render children?.()}
					</div>
				{/snippet}
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Animating components kept in DOM when closed with the Web Animations API

Components that specify `keepMounted` remain rendered in the DOM when they are closed. A Svelte transition doesn't play for them, because the element is hidden instead of removed. These elements need a different approach to be animated:

- Use the `render` snippet to render the `Popup` element yourself
- Animate the properties based on the `open` state, with an attachment that calls `element.animate()`

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import type { Attachment } from 'svelte/attachments';

	function animateOpen(open: boolean): Attachment<HTMLElement> {
		return (element) => {
			// Starting from the current values lets a reopen reverse a closing animation midway.
			const { opacity, scale } = getComputedStyle(element);
			element.animate(
				[
					{ opacity, scale },
					{ opacity: open ? 1 : 0, scale: open ? 1 : 0.8 }
				],
				{ duration: 200, easing: 'ease-out', fill: 'forwards' }
			);
		};
	}
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-8 items-center justify-center border border-neutral-950 bg-white px-3 text-sm font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white"
	>
		Trigger
	</Popover.Trigger>
	<Popover.Portal keepMounted>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="box-border max-w-[500px] origin-[var(--transform-origin)] border border-neutral-950 bg-white px-4 py-3 text-sm text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				{#snippet render(props, state, children)}
					<div {...props} {@attach animateOpen(state.open)}>
						{@render children?.()}
					</div>
				{/snippet}
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Animating Select component with the Web Animations API

The Select component is removed from the DOM until its first interaction and stays in the DOM after that. To animate it, a mix of the two previous approaches is needed: the attachment animates the popup in when it mounts open, and on each change of the `open` state after that.

```svelte demo
<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import type { Attachment } from 'svelte/attachments';

	const fonts = [
		{ label: 'Select font', value: null },
		{ label: 'Sans-serif', value: 'sans' },
		{ label: 'Serif', value: 'serif' },
		{ label: 'Monospace', value: 'mono' },
		{ label: 'Cursive', value: 'cursive' }
	];

	function animateOpen(open: boolean): Attachment<HTMLElement> {
		return (element) => {
			// A popup that mounts open has no earlier animation, so it starts from the closed values.
			const mountedOpen = open && element.getAnimations().length === 0;
			const { opacity, scale } = mountedOpen
				? { opacity: '0', scale: '0.8' }
				: getComputedStyle(element);
			element.animate(
				[
					{ opacity, scale },
					{ opacity: open ? 1 : 0, scale: open ? 1 : 0.8 }
				],
				{ duration: 200, easing: 'ease-out', fill: 'forwards' }
			);
		};
	}
</script>

<Select.Root items={fonts}>
	<Select.Trigger
		class="box-border flex h-8 min-w-36 items-center justify-between gap-3 border border-neutral-950 bg-white pr-1 pl-2 text-sm text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white"
	>
		<Select.Value
			class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
		/>
		<Select.Icon class="flex">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
			</svg>
		</Select.Icon>
	</Select.Trigger>
	<Select.Portal>
		<Select.Positioner class="z-10 outline-none select-none" sideOffset={4}>
			<Select.Popup
				class="box-border min-w-[var(--anchor-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white bg-clip-padding text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				{#snippet render(props, state, children)}
					<div {...props} {@attach animateOpen(state.open)}>
						{@render children?.()}
					</div>
				{/snippet}
				<Select.ScrollUpArrow
					class="z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-xs dark:bg-neutral-950"
				/>
				<Select.List
					class="relative box-border max-h-[var(--available-height)] scroll-py-6 overflow-y-auto py-1"
				>
					{#each fonts as { label, value } (label)}
						<Select.Item
							{value}
							class="box-border grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-none select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
						>
							<Select.ItemIndicator class="col-start-1">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path d="m2.5 8.5 4 4 7-9" />
								</svg>
							</Select.ItemIndicator>
							<Select.ItemText class="col-start-2">{label}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.List>
				<Select.ScrollDownArrow
					class="z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-xs dark:bg-neutral-950"
				/>
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
```

### Manual unmounting

Use this when Sveltery Base can't detect your closing animation, for example when the animation runs frame by frame in JavaScript, such as a Svelte [`Tween`](https://svelte.dev/docs/svelte/svelte-motion#Tween), or when the popup should stay in its closing phase until something other than an animation completes.

Call `eventDetails.preventUnmountOnClose()` in `onOpenChange` when the component closes, then call `unmount()` on the `Root` once the animation finishes. Base UI exposes `unmount()` through an `actionsRef` prop. In Sveltery Base, `unmount()` is a method of the `Root` component, which you read with `bind:this`.
This ends the closing phase, and `onOpenChangeComplete(false)` fires. Whether the popup leaves the DOM is still decided by `keepMounted`.

```svelte title="manual-unmount.svelte"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import { Tween } from 'svelte/motion';

	// @highlight-text "root"
	let root = $state<ReturnType<typeof Popover.Root>>();
	const scale = new Tween(0, { duration: 200 });
</script>

<Popover.Root
	// @highlight-text "bind:this"
	bind:this={root}
	onOpenChange={(nextOpen, eventDetails) => {
		if (nextOpen) {
			scale.target = 1;
			return;
		}
		// @highlight-text "preventUnmountOnClose"
		eventDetails.preventUnmountOnClose();
		// @highlight-text "root"
		scale.set(0).then(() => root?.unmount());
	}}
>
	<Popover.Trigger>Trigger</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup style="transform: scale({scale.current})">Popup</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```
