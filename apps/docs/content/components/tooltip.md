---
title: Tooltip
description: A popup that appears when an element is hovered or focused, showing a hint for sighted users.
---

```svelte demo
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger
			class="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800"
		>
			Bold
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner sideOffset={10}>
				<Tooltip.Popup
					class="origin-[var(--transform-origin)] rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Tooltip.Arrow
						class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.5 data-[side=left]:rotate-90 data-[side=right]:-left-3.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
					>
						<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
							<path
								d="M0 10L10 1L20 10"
								class="fill-gray-50 stroke-gray-200 dark:fill-gray-900 dark:stroke-gray-700"
							/>
						</svg>
					</Tooltip.Arrow>
					Bold text
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger />
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup>
					<Tooltip.Arrow />
					<Tooltip.Viewport />
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
```

`Tooltip.Provider`, `Tooltip.Arrow`, and `Tooltip.Viewport` are optional. `Tooltip.Positioner` and `Tooltip.Popup` are required.

## Examples

### Open state

Bind `open` to read and change whether the tooltip is open. Without `bind:`, the tooltip manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	let open = $state(false);
	let reason = $state('none yet');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={open} />
		Open from outside
	</label>
	<p>Last change reason: {reason}</p>
	<Tooltip.Root bind:open onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}>
		<Tooltip.Trigger
			class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			Hover or focus me
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner sideOffset={8}>
				<Tooltip.Popup
					class="origin-[var(--transform-origin)] rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					Press Escape to close.
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</div>
```

The `reason` in the event details is one of `trigger-hover`, `trigger-focus`, `trigger-press`, `outside-press`, `escape-key`, `disabled`, `imperative-action`, or `none`.

### Delay and close delay

Set `delay` on a trigger for the wait before the tooltip opens on hover. Set `closeDelay` for the wait before it closes. Both are in milliseconds. `delay` defaults to 600 and `closeDelay` defaults to 0. Hover opens the tooltip after the pointer rests on the trigger for `delay`. Keyboard focus opens it at once.

```svelte demo
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800';
	const popup =
		'origin-[var(--transform-origin)] rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700';
</script>

<div class="flex items-center gap-3">
	<Tooltip.Root>
		<Tooltip.Trigger delay={0} class={button}>No delay</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner sideOffset={8}>
				<Tooltip.Popup class={popup}>Opens at once.</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>

	<Tooltip.Root>
		<Tooltip.Trigger delay={1500} closeDelay={1000} class={button}>Slow</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner sideOffset={8}>
				<Tooltip.Popup class={popup}>Opens after 1.5 s. Closes after 1 s.</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</div>
```

### Group tooltips with a provider

`Tooltip.Provider` shares one delay between the tooltips inside it. After one tooltip opens, its neighbors open at once, with no delay, until the group goes idle. The group goes idle `timeout` milliseconds after the close delay of the last tooltip ends. `timeout` is in milliseconds and defaults to 400.

`delay` and `closeDelay` on the provider are the defaults for every trigger inside it. A `delay` or `closeDelay` on a trigger wins. Without any `delay`, a trigger waits 600 milliseconds.

```svelte demo
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const actions = ['Bold', 'Italic', 'Underline'];
</script>

<Tooltip.Provider delay={400}>
	<div class="flex gap-2">
		{#each actions as action (action)}
			<Tooltip.Root>
				<Tooltip.Trigger
					class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800"
				>
					{action}
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Positioner sideOffset={8}>
						<Tooltip.Popup
							class="origin-[var(--transform-origin)] rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
						>
							{action} text
						</Tooltip.Popup>
					</Tooltip.Positioner>
				</Tooltip.Portal>
			</Tooltip.Root>
		{/each}
	</div>
</Tooltip.Provider>
```

While a tooltip opens or closes because of its neighbor, the popup and the positioner set `data-instant="delay"`. Turn off the transition on `data-[instant]` to skip the animation, as the demo does.

### Follow the cursor

Set `trackCursorAxis` on `Tooltip.Root` to make the tooltip follow the pointer. `'x'` follows the cursor horizontally, `'y'` follows it vertically, `'both'` follows it on both axes, and `'none'` is the default. The positioner sets `data-instant="tracking-cursor"` while tracking is on. With `'both'`, the popup ignores pointer events, so the pointer cannot move onto it.

```svelte demo
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';
</script>

<Tooltip.Root trackCursorAxis="x">
	<Tooltip.Trigger
		class="w-72 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-6 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Move the pointer across this button
	</Tooltip.Trigger>
	<Tooltip.Portal>
		<Tooltip.Positioner sideOffset={12}>
			<Tooltip.Popup
				class="rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md outline outline-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				Follows the cursor on the x axis.
			</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
</Tooltip.Root>
```

### Detached triggers

A trigger does not have to sit inside `Tooltip.Root`. Create a handle with `Tooltip.createHandle()` and pass it to the root and to each trigger as `handle`. The trigger can then live anywhere on the page.

Give each trigger a `payload` and read it from `handle.payload`. Type the payload with `Tooltip.createHandle<T>()`. One tooltip serves every trigger, moves to the trigger that opened it, and shows that trigger's payload.

```svelte demo
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const handle = Tooltip.createHandle<{ text: string }>();

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800';
</script>

<div class="flex items-center gap-3">
	<Tooltip.Trigger {handle} payload={{ text: 'Create a new file' }} class={button}>
		New
	</Tooltip.Trigger>
	<Tooltip.Trigger {handle} payload={{ text: 'Open an existing file' }} class={button}>
		Open
	</Tooltip.Trigger>
	<Tooltip.Trigger {handle} payload={{ text: 'Save the current file' }} class={button}>
		Save
	</Tooltip.Trigger>

	<Tooltip.Root {handle}>
		<Tooltip.Portal>
			<Tooltip.Positioner sideOffset={8}>
				<Tooltip.Popup
					class="origin-[var(--transform-origin)] rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					{handle.payload?.text}
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</div>
```

A handle also controls the tooltip from code. Call `handle.open(triggerId)`, `handle.close()`, or `handle.unmount()`. Read `handle.isOpen` and `handle.payload` to inspect it. `handle.open(triggerId)` throws when no trigger with that id is registered, because the tooltip needs a trigger to anchor to.

You can also put several triggers inside one `Tooltip.Root` without a handle. Each trigger still takes its own `payload`, and the snippet you pass as the children of `Tooltip.Root` receives it as `{ payload }`.

## Differences from Base UI

- `open` and `triggerId` are bindable props. Use `bind:open` and `bind:triggerId` instead of `open`, `defaultOpen`, `triggerId`, and `defaultTriggerId`. There are no `defaultOpen` or `defaultTriggerId` props. A value you pass without `bind:` sets the initial state.
- `actionsRef` is not available. Use `bind:this` on `Tooltip.Root`, which exposes `close()` and `unmount()`.
- `Tooltip.createHandle()` works as in Base UI. The library also exports `createTooltipHandle` by name.
- The `Tooltip.Root` children snippet receives `{ payload }`, where React passes a render function.
- The `*DataAttributes` and `*CssVars` enums are not exported. Use the attribute and variable names in this page.
- The popup has no `role`, and the trigger has no `aria-describedby` or `type`. Base UI renders them the same way.
- A disabled trigger renders `data-trigger-disabled`, as in Base UI v1.9.0. The shared helper that checks whether a target is inside an enabled trigger still looks for `data-disabled`. So it treats a disabled tooltip trigger as enabled. Base UI closes an open tooltip when focus moves to a disabled trigger.
- The positioner is placed with `top` and `left`. Base UI v1.9.0 uses `transform` when no `Tooltip.Viewport` is mounted.
- The previous container in `Tooltip.Viewport` does not set `--popup-width` and `--popup-height`.

## API reference

### Provider

<ApiPart name="tooltip" part="Provider" />

`Tooltip.Provider` renders no element, so it has no data attributes.

### Root

<ApiPart name="tooltip" part="Root" />

`Tooltip.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="tooltip" part="Trigger" />

| Attribute               | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `data-popup-open`       | Present when the tooltip is open and this trigger opened it. |
| `data-trigger-disabled` | Present when the trigger is disabled.                        |

### Portal

<ApiPart name="tooltip" part="Portal" />

### Positioner

<ApiPart name="tooltip" part="Positioner" />

Without props, the positioner places the popup above the trigger and centers it. `side` defaults to `top`, `align` to `center`, `sideOffset` and `alignOffset` to `0`, `collisionPadding` to `5`, and `arrowPadding` to `5`. `anchor` defaults to the trigger that opened the tooltip. `positionMethod` defaults to `absolute`, and `collisionBoundary` defaults to the clipping ancestors of the popup. `sticky` and `disableAnchorTracking` default to `false`. By default, the popup moves to the opposite side when it does not fit on the chosen side.

| Attribute            | Description                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `data-open`          | Present when the tooltip is open.                                                                                                       |
| `data-closed`        | Present when the tooltip is closed.                                                                                                     |
| `data-anchor-hidden` | Present when the trigger is hidden or clipped, so the tooltip has nothing to point at.                                                  |
| `data-side`          | The side of the trigger the tooltip is on after collisions.                                                                             |
| `data-align`         | How the tooltip lines up with the trigger after collisions.                                                                             |
| `data-instant`       | `tracking-cursor` while the tooltip follows the cursor. Otherwise `delay`, `dismiss`, or `focus` when the tooltip skips its transition. |

| CSS variable          | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `--anchor-width`      | The width of the trigger.                                                      |
| `--anchor-height`     | The height of the trigger.                                                     |
| `--available-width`   | The width between the trigger and the edge of the boundary.                    |
| `--available-height`  | The height between the trigger and the edge of the boundary.                   |
| `--positioner-width`  | The width of the positioner.                                                   |
| `--positioner-height` | The height of the positioner.                                                  |
| `--transform-origin`  | The point on the tooltip that the trigger is closest to, for scale animations. |

### Popup

<ApiPart name="tooltip" part="Popup" />

| Attribute             | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `data-open`           | Present when the tooltip is open.                                     |
| `data-closed`         | Present when the tooltip is closed.                                   |
| `data-side`           | The side of the trigger the tooltip is on after collisions.           |
| `data-align`          | How the tooltip lines up with the trigger after collisions.           |
| `data-instant`        | `delay`, `dismiss`, or `focus` when the tooltip skips its transition. |
| `data-starting-style` | Present when the tooltip is animating in.                             |
| `data-ending-style`   | Present when the tooltip is animating out.                            |

| CSS variable     | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `--popup-width`  | The width of the popup, while `Tooltip.Viewport` animates a size change.  |
| `--popup-height` | The height of the popup, while `Tooltip.Viewport` animates a size change. |

### Arrow

<ApiPart name="tooltip" part="Arrow" />

| Attribute         | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `data-open`       | Present when the tooltip is open.                                     |
| `data-closed`     | Present when the tooltip is closed.                                   |
| `data-side`       | The side of the trigger the tooltip is on after collisions.           |
| `data-align`      | How the tooltip lines up with the trigger after collisions.           |
| `data-uncentered` | Present when the arrow cannot point at the center of the trigger.     |
| `data-instant`    | `delay`, `dismiss`, or `focus` when the tooltip skips its transition. |

### Viewport

<ApiPart name="tooltip" part="Viewport" />

Use `Tooltip.Viewport` when one tooltip has several triggers and you want to animate the content change. While the viewport animates, it renders the content of the previous trigger in an element with `data-previous` and the new content in an element with `data-current`.

| Attribute                   | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `data-activation-direction` | Where the new trigger sits relative to the previous one, such as `left` or `right down`. |
| `data-transitioning`        | Present while the previous content is on screen.                                         |
| `data-instant`              | `delay`, `dismiss`, or `focus` when the tooltip skips its transition.                    |
