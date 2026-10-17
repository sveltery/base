# Animation

<Subtitle>
  A guide to animating Sveltery Base components.
</Subtitle>

<Meta name="description" content="A guide to animating Sveltery Base components." />

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

<script>
	import { DemoAnimatedPopoverSvelteTransitionKeepMountedFalse } from './demos/animated-popover-svelte-transition-keep-mounted-false';
	import { DemoAnimatedPopoverWebAnimationsKeepMountedTrue } from './demos/animated-popover-web-animations-keep-mounted-true';
	import { DemoAnimatedSelectWebAnimations } from './demos/animated-select-web-animations';
</script>

<DemoAnimatedPopoverSvelteTransitionKeepMountedFalse />

```svelte title="animated-popover.svelte"
<Popover.Root>
	<Popover.Trigger>Trigger</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>
				<!-- @highlight-start -->
				{#snippet render(props, state, children)}
					<div {...props} transition:scale|global={{ start: 0.8 }}>
						{@render children?.()}
					</div>
				{/snippet}
				<!-- @highlight-end -->
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

<DemoAnimatedPopoverWebAnimationsKeepMountedTrue />

```svelte title="animated-popover.svelte"
<Popover.Root>
	<Popover.Trigger>Trigger</Popover.Trigger>
	<Popover.Portal keepMounted>
		<!-- @highlight-text "keepMounted" -->
		<Popover.Positioner>
			<Popover.Popup>
				<!-- @highlight-start -->
				{#snippet render(props, state, children)}
					<div {...props} {@attach animateOpen(state.open)}>
						{@render children?.()}
					</div>
				{/snippet}
				<!-- @highlight-end -->
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Animating Select component with the Web Animations API

The Select component is removed from the DOM until its first interaction and stays in the DOM after that. To animate it, a mix of the two previous approaches is needed: the attachment animates the popup in when it mounts open, and on each change of the `open` state after that.

<DemoAnimatedSelectWebAnimations />

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
