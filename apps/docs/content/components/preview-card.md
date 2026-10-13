---
title: Preview Card
description: A popup that previews the content behind a link when the link is hovered or focused.
---

```svelte demo
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';
</script>

<p class="max-w-sm text-base text-gray-900 dark:text-gray-100">
	Good
	<PreviewCard.Root>
		<PreviewCard.Trigger
			href="https://en.wikipedia.org/wiki/Typography"
			class="text-blue-800 underline decoration-blue-800/60 underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:text-blue-400 dark:decoration-blue-400/60"
		>
			typography
		</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup
					class="w-64 origin-[var(--transform-origin)] rounded-lg bg-gray-50 p-4 text-sm text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<PreviewCard.Arrow
						class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.5 data-[side=left]:rotate-90 data-[side=right]:-left-3.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
					>
						<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
							<path
								d="M0 10L10 1L20 10"
								class="fill-gray-50 stroke-gray-200 dark:fill-gray-900 dark:stroke-gray-700"
							/>
						</svg>
					</PreviewCard.Arrow>
					<p class="font-medium">Typography</p>
					<p class="mt-1 text-gray-600 dark:text-gray-400">
						Typography is the art of arranging type to make written language legible and appealing.
					</p>
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
	design makes the page easier to read.
</p>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';
</script>

<PreviewCard.Root>
	<PreviewCard.Trigger />
	<PreviewCard.Portal>
		<PreviewCard.Backdrop />
		<PreviewCard.Positioner>
			<PreviewCard.Popup>
				<PreviewCard.Arrow />
				<PreviewCard.Viewport />
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
</PreviewCard.Root>
```

`PreviewCard.Backdrop`, `PreviewCard.Arrow`, and `PreviewCard.Viewport` are optional. `PreviewCard.Positioner` and `PreviewCard.Popup` are required. `PreviewCard.Trigger` renders an `<a>` element.

## Examples

### Open state

Bind `open` to read and change whether the card is open. Without `bind:`, the card manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	let open = $state(false);
	let reason = $state('none yet');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={open} />
		Open from outside
	</label>
	<p>Last change reason: {reason}</p>
	<PreviewCard.Root
		bind:open
		onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}
	>
		<PreviewCard.Trigger
			href="https://en.wikipedia.org/wiki/Typography"
			class="text-blue-800 underline decoration-blue-800/60 underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:text-blue-400 dark:decoration-blue-400/60"
		>
			Hover or focus this link
		</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup
					class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-4 py-3 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					Press Escape to close.
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
</div>
```

The `reason` in the event details is one of `trigger-hover`, `trigger-focus`, `trigger-press`, `outside-press`, `escape-key`, `imperative-action`, or `none`.

### Delay and close delay

Set `delay` on a trigger for the wait before the card opens on hover. Set `closeDelay` for the wait before it closes. Both are in milliseconds. `delay` defaults to 600 and `closeDelay` defaults to 300. A longer `closeDelay` gives the pointer time to cross the gap between the link and the card.

```svelte demo
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const link =
		'text-blue-800 underline decoration-blue-800/60 underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:text-blue-400 dark:decoration-blue-400/60';
	const popup =
		'origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700';
</script>

<div class="flex items-center gap-6 text-sm">
	<PreviewCard.Root>
		<PreviewCard.Trigger href="https://en.wikipedia.org/wiki/Typography" delay={100} class={link}>
			Quick open
		</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup class={popup}>Opens after 100 ms.</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>

	<PreviewCard.Root>
		<PreviewCard.Trigger
			href="https://en.wikipedia.org/wiki/Typography"
			closeDelay={1000}
			class={link}
		>
			Slow close
		</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup class={popup}>Closes 1 s after the pointer leaves.</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
</div>
```

### Detached triggers

A trigger does not have to sit inside `PreviewCard.Root`. Create a handle with `PreviewCard.createHandle()` and pass it to the root and to each trigger as `handle`. The trigger can then live anywhere on the page.

Give each trigger a `payload` and read it from `handle.payload`. Type the payload with `PreviewCard.createHandle<T>()`. One card serves every trigger, moves to the trigger that opened it, and shows that trigger's payload.

```svelte demo
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const handle = PreviewCard.createHandle<{ title: string; body: string }>();

	const link =
		'text-blue-800 underline decoration-blue-800/60 underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-blue-800 dark:text-blue-400 dark:decoration-blue-400/60';
</script>

<div class="flex items-center gap-6 text-sm">
	<PreviewCard.Trigger
		{handle}
		href="https://en.wikipedia.org/wiki/Typography"
		payload={{ title: 'Typography', body: 'The art of arranging type so that text reads well.' }}
		class={link}
	>
		Typography
	</PreviewCard.Trigger>
	<PreviewCard.Trigger
		{handle}
		href="https://en.wikipedia.org/wiki/Typeface"
		payload={{ title: 'Typeface', body: 'A design of lettering that can come in several fonts.' }}
		class={link}
	>
		Typeface
	</PreviewCard.Trigger>
	<PreviewCard.Trigger
		{handle}
		href="https://en.wikipedia.org/wiki/Kerning"
		payload={{ title: 'Kerning', body: 'The adjustment of space between pairs of letters.' }}
		class={link}
	>
		Kerning
	</PreviewCard.Trigger>

	<PreviewCard.Root {handle}>
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup
					class="w-64 origin-[var(--transform-origin)] rounded-lg bg-gray-50 p-4 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<p class="font-medium">{handle.payload?.title}</p>
					<p class="mt-1 text-gray-600 dark:text-gray-400">{handle.payload?.body}</p>
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
</div>
```

A handle also controls the card from code. Call `handle.open(triggerId)`, `handle.close()`, or `handle.unmount()`. Read `handle.isOpen` and `handle.payload` to inspect it. `handle.open(triggerId)` throws when no trigger with that id is registered, because the card needs a trigger to anchor to.

You can also put several triggers inside one `PreviewCard.Root` without a handle. Each trigger still takes its own `payload`, and the snippet you pass as the children of `PreviewCard.Root` receives it as `{ payload }`.

## Differences from Base UI

- `open` and `triggerId` are bindable props. Use `bind:open` and `bind:triggerId` instead of `open`, `defaultOpen`, `triggerId`, and `defaultTriggerId`. There are no `defaultOpen` or `defaultTriggerId` props. The first value you pass is the default.
- `actionsRef` is not available. Use `bind:this` on `PreviewCard.Root`, which exposes `close()` and `unmount()`.
- The `PreviewCard*DataAttributes` and `PreviewCard*CssVars` namespaces are not exported. Use the attribute and variable names in this page.
- Create a handle with `PreviewCard.createHandle()` or `createPreviewCardHandle`. There is no top-level `createHandle` export, because Popover already exports that name from the library barrel.
- Each trigger supplies its `payload` and `closeDelay`, and the card reads them from the active trigger. A change to the payload of the active trigger shows at once. If the active trigger unmounts while the card stays open, for example after you cancel a close, the card keeps the values the trigger had when it unmounted.
- A bound `triggerId` whose element registers late moves the anchor to that element. A card opened without a trigger press uses its only trigger as the anchor.
- When the active trigger unregisters, the card closes with the reason `none`. The close runs in a microtask, so a replacement trigger registered in the same tick keeps the card open. A canceled close leaves the old element as the anchor.
- The positioner places the popup with `top` and `left`. Base UI v1.9.0 uses `transform` when no `PreviewCard.Viewport` is mounted.
- The previous pane in `PreviewCard.Viewport` does not carry `--popup-width` and `--popup-height`.

## API reference

### Root

<ApiPart name="preview-card" part="Root" />

`PreviewCard.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="preview-card" part="Trigger" />

| Attribute         | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `data-popup-open` | Present when the card is open and this trigger opened it. |

### Portal

<ApiPart name="preview-card" part="Portal" />

### Backdrop

<ApiPart name="preview-card" part="Backdrop" />

| Attribute             | Description                             |
| --------------------- | --------------------------------------- |
| `data-open`           | Present when the card is open.          |
| `data-closed`         | Present when the card is closed.        |
| `data-starting-style` | Present when the card is animating in.  |
| `data-ending-style`   | Present when the card is animating out. |

### Positioner

<ApiPart name="preview-card" part="Positioner" />

Without props, the positioner places the popup below the trigger and centers it. `side` defaults to `bottom`, `align` to `center`, `sideOffset` and `alignOffset` to `0`, `collisionPadding` to `5`, and `arrowPadding` to `5`. `anchor` defaults to the trigger that opened the card. `positionMethod` defaults to `absolute`, and `collisionBoundary` defaults to the clipping ancestors of the popup. `sticky` and `disableAnchorTracking` default to `false`. By default, the popup moves to the opposite side when it does not fit on the chosen side.

| Attribute            | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| `data-open`          | Present when the card is open.                                                      |
| `data-closed`        | Present when the card is closed.                                                    |
| `data-anchor-hidden` | Present when the trigger is hidden or clipped, so the card has nothing to point at. |
| `data-side`          | The side of the trigger the card is on after collisions.                            |
| `data-align`         | How the card lines up with the trigger after collisions.                            |
| `data-instant`       | `dismiss` or `focus` when the card skips its transition.                            |

| CSS variable          | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `--anchor-width`      | The width of the trigger.                                                   |
| `--anchor-height`     | The height of the trigger.                                                  |
| `--available-width`   | The width between the trigger and the edge of the boundary.                 |
| `--available-height`  | The height between the trigger and the edge of the boundary.                |
| `--positioner-width`  | The width of the positioner.                                                |
| `--positioner-height` | The height of the positioner.                                               |
| `--transform-origin`  | The point on the card that the trigger is closest to, for scale animations. |

### Popup

<ApiPart name="preview-card" part="Popup" />

| Attribute             | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `data-open`           | Present when the card is open.                           |
| `data-closed`         | Present when the card is closed.                         |
| `data-side`           | The side of the trigger the card is on after collisions. |
| `data-align`          | How the card lines up with the trigger after collisions. |
| `data-instant`        | `dismiss` or `focus` when the card skips its transition. |
| `data-starting-style` | Present when the card is animating in.                   |
| `data-ending-style`   | Present when the card is animating out.                  |

| CSS variable     | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `--popup-width`  | The width of the popup, while `PreviewCard.Viewport` animates a size change.  |
| `--popup-height` | The height of the popup, while `PreviewCard.Viewport` animates a size change. |

### Arrow

<ApiPart name="preview-card" part="Arrow" />

| Attribute         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `data-open`       | Present when the card is open.                                    |
| `data-closed`     | Present when the card is closed.                                  |
| `data-side`       | The side of the trigger the card is on after collisions.          |
| `data-align`      | How the card lines up with the trigger after collisions.          |
| `data-uncentered` | Present when the arrow cannot point at the center of the trigger. |

### Viewport

<ApiPart name="preview-card" part="Viewport" />

Use `PreviewCard.Viewport` when one card has several triggers and you want to animate the content change. While the viewport animates, it renders the content of the previous trigger in an element with `data-previous` and the new content in an element with `data-current`.

| Attribute                   | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `data-activation-direction` | Where the new trigger sits relative to the previous one, such as `left` or `right down`. |
| `data-transitioning`        | Present while the previous content is on screen.                                         |
| `data-instant`              | `dismiss` or `focus` when the card skips its transition.                                 |
