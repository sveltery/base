---
title: Drawer
description: A panel that slides in from the edge of the screen and can be swiped away.
---

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
</script>

<Drawer.Root>
	<Drawer.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Open drawer
	</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.2*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0 dark:opacity-[calc(0.7*(1-var(--drawer-swipe-progress)))]"
		/>
		<Drawer.Viewport class="fixed inset-0 z-50 flex items-end justify-center">
			<Drawer.Popup
				class="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-gray-50 px-6 pt-4 pb-8 text-gray-900 outline outline-gray-200 transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateY(var(--drawer-swipe-movement-y))] data-[ending-style]:[transform:translateY(100%)] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:select-none dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<div class="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
				<Drawer.Content class="mx-auto max-w-lg">
					<Drawer.Title class="mb-1 text-lg font-medium">Notifications</Drawer.Title>
					<Drawer.Description class="mb-6 text-base text-gray-600 dark:text-gray-400">
						You are all caught up. Swipe down or press Escape to close.
					</Drawer.Description>
					<div class="flex justify-end">
						<Drawer.Close
							class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
						>
							Close
						</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
```

A drawer is a dialog that lives at an edge of the screen. It opens from a trigger, closes on Escape, a close button, or an outside press, and follows the finger or the mouse when you swipe it toward its edge. A swipe past the threshold, or a fast flick, closes it. A short swipe springs back.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
</script>

<Drawer.Provider>
	<Drawer.IndentBackground />
	<Drawer.Indent>
		<Drawer.Root>
			<Drawer.Trigger />
			<Drawer.SwipeArea />
			<Drawer.Portal>
				<Drawer.Backdrop />
				<Drawer.Viewport>
					<Drawer.Popup>
						<Drawer.Content>
							<Drawer.Title />
							<Drawer.Description />
							<Drawer.Close />
						</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	</Drawer.Indent>
</Drawer.Provider>
```

`Drawer.Viewport` is required: it runs the swipe gesture. `Drawer.Provider`, `Drawer.Indent`, `Drawer.IndentBackground`, `Drawer.SwipeArea`, and `Drawer.Content` are optional.

## Styling the swipe

The drawer writes the gesture into CSS variables on the popup instead of moving it itself. Translate the popup by `--drawer-swipe-movement-y` for a vertical drawer, or `--drawer-swipe-movement-x` for a horizontal one, and fade the backdrop with `--drawer-swipe-progress`, which runs from `0` when open to `1` when fully swiped away. While a swipe runs, the popup and backdrop carry `data-swiping`, so you can turn their transitions off.

Use `transform` for the movement, as the demos do. The drawer reads the popup's computed `transform` when a swipe starts, and the `translate` property is not part of it. On release, `--drawer-swipe-strength` scales from 0.1 to 1 with the swipe's speed. Multiply your exit transition's duration by it so a fast flick finishes quickly.

## Examples

### Open state

Bind `open` to read and change whether the drawer is open. Without `bind:`, the drawer manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	let open = $state(false);
	let reason = $state('none yet');

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<button type="button" class={button} onclick={() => (open = true)}>Open from code</button>
	<p>Open: {open}. Last change reason: {reason}</p>
	<Drawer.Root bind:open onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}>
		<Drawer.Portal>
			<Drawer.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-[calc(0.2*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
			/>
			<Drawer.Viewport class="fixed inset-0 z-50 flex items-end justify-center">
				<Drawer.Popup
					class="w-full rounded-t-2xl bg-gray-50 px-6 pt-4 pb-8 text-gray-900 outline outline-gray-200 transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateY(var(--drawer-swipe-movement-y))] data-[ending-style]:[transform:translateY(100%)] data-[starting-style]:[transform:translateY(100%)] dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Drawer.Title class="mb-1 text-lg font-medium">Close it any way you like</Drawer.Title>
					<Drawer.Description class="mb-6 text-gray-600 dark:text-gray-400">
						Swipe down, press Escape, click outside, or use the button. The reason updates.
					</Drawer.Description>
					<Drawer.Close class={button}>Close</Drawer.Close>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
</div>
```

The `reason` in the event details is one of `trigger-press`, `outside-press`, `escape-key`, `close-watcher`, `close-press`, `focus-out`, `imperative-action`, `swipe`, or `none`. `close-watcher` is the Android back gesture in Chromium. Assigning `open = true` yourself does not call `onOpenChange`.

### Snap points

Pass `snapPoints` to let the drawer rest at several heights. A number from 0 to 1 is a fraction of the viewport height, a larger number is pixels, and a string takes `px` or `rem`. The popup carries `--drawer-snap-point-offset`, the distance it sits below its full height. Add it to the swipe movement in your `transform`. Bind `snapPoint` to read or set the active one. The drawer returns to `defaultSnapPoint`, or the first snap point, when it closes.

```svelte demo
<script lang="ts">
	import { Drawer, type DrawerSnapPoint } from '@sveltery/base/drawer';

	const snapPoints: DrawerSnapPoint[] = ['148px', 0.6, 1];
	let snapPoint = $state<DrawerSnapPoint | null | undefined>('148px');

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Snap point: {JSON.stringify(snapPoint)}</p>
	<Drawer.Root {snapPoints} bind:snapPoint>
		<Drawer.Trigger class={button}>Open sheet</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-[450ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
			/>
			<Drawer.Viewport class="fixed inset-0 z-50 flex items-end justify-center">
				<Drawer.Popup
					class="h-[calc(100dvh-2rem)] w-full rounded-t-2xl bg-gray-50 px-6 pt-4 text-gray-900 outline outline-gray-200 transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] data-[ending-style]:[transform:translateY(100%)] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:select-none dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<div class="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
					<Drawer.Title class="mb-1 text-lg font-medium">Drag me up</Drawer.Title>
					<Drawer.Description class="mb-4 text-gray-600 dark:text-gray-400">
						The sheet rests at 148px, 60% of the screen, or full height.
					</Drawer.Description>
					<div class="flex gap-2">
						{#each snapPoints as point (point)}
							<button type="button" class={button} onclick={() => (snapPoint = point)}>
								{point}
							</button>
						{/each}
					</div>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
</div>
```

A fast swipe can skip snap points. Set `snapToSequentialPoints` to pick the next snap point from the drag distance alone. The popup has `data-expanded` at the full-height snap point `1`.

### Swipe direction

`swipeDirection` sets the edge the drawer closes toward: `down` (the default), `up`, `left`, or `right`. Position the popup at that edge and translate it along the matching axis.

```svelte demo
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="text-sm text-gray-900 dark:text-gray-100">
	<Drawer.Root swipeDirection="right">
		<Drawer.Trigger class={button}>Open side panel</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-[calc(0.2*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
			/>
			<Drawer.Viewport class="fixed inset-0 z-50 flex justify-end">
				<Drawer.Popup
					class="h-full w-80 max-w-[calc(100vw-3rem)] bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateX(var(--drawer-swipe-movement-x))] data-[ending-style]:[transform:translateX(100%)] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:select-none dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Drawer.Title class="mb-1 text-lg font-medium">Settings</Drawer.Title>
					<Drawer.Description class="mb-6 text-gray-600 dark:text-gray-400">
						Swipe right to close.
					</Drawer.Description>
					<Drawer.Close class={button}>Close</Drawer.Close>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
</div>
```

### Opening with a swipe

`Drawer.SwipeArea` is an invisible strip that opens the drawer when you swipe away from the edge. Place it along the edge the drawer comes from. Its own `swipeDirection` is the opening direction, which defaults to the opposite of the root's. Set `disabled` to turn it off.

```svelte
<Drawer.Root>
	<Drawer.SwipeArea class="fixed inset-x-0 bottom-0 h-6" />
	<Drawer.Portal>…</Drawer.Portal>
</Drawer.Root>
```

While the swipe runs, the popup follows it through the same CSS variables. Releasing past the threshold opens the drawer with the reason `swipe`.

### Indenting the page

Wrap the page in `Drawer.Provider` and `Drawer.Indent` to scale it back while a drawer is open, as native sheets do. `Drawer.Indent` and `Drawer.IndentBackground` carry `data-active` while any drawer in the provider is open, and `data-inactive` otherwise. `Drawer.Indent` also receives `--drawer-swipe-progress`, so the page can follow the swipe.

```svelte
<Drawer.Provider>
	<Drawer.IndentBackground class="fixed inset-0 bg-black" />
	<Drawer.Indent
		class="min-h-dvh bg-white transition-transform duration-[450ms] data-[active]:scale-[calc(0.94+0.06*var(--drawer-swipe-progress))] data-[active]:rounded-xl"
	>
		<!-- The page and its drawers -->
	</Drawer.Indent>
</Drawer.Provider>
```

### Nested drawers

A `Drawer.Root` inside another drawer's popup is nested. The parent popup carries `data-nested-drawer-open` while the child is open and `data-nested-drawer-swiping` while the child is swiped. `--nested-drawers` counts the open drawers above it, and `--drawer-frontmost-height` is the height of the frontmost one, so the parent can shrink behind the child. Escape closes only the frontmost drawer.

### Forms and the software keyboard

Wrap a drawer that holds text fields in `Drawer.VirtualKeyboardProvider`. On touch devices, it keeps the focused field above the software keyboard. It adds scroll room to the field's scroll container, centers the field in the visible space, and sets `--drawer-keyboard-inset` on `Drawer.Viewport` to the height the keyboard covers. Pad your popup with that variable when it is not scrollable.

```svelte
<Drawer.Root>
	<Drawer.VirtualKeyboardProvider>
		<Drawer.Portal>
			<Drawer.Viewport class="fixed inset-0 flex items-end pb-[var(--drawer-keyboard-inset)]">
				<Drawer.Popup>
					<Drawer.Content class="overflow-y-auto">
						<input type="text" />
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.VirtualKeyboardProvider>
</Drawer.Root>
```

### Text selection and scrolling

Swipes start anywhere in the popup. A mouse or pen drag does not start on a button, link, form field, or label, and inside `Drawer.Content` it selects text instead. A finger can swipe from anywhere. A scroll container inside the popup scrolls first, and the drawer takes over the swipe once the container reaches its edge.

### Detached triggers

A trigger does not have to sit inside `Drawer.Root`. Create a handle with `Drawer.createHandle()` and pass it to the root and to each trigger as `handle`. A handle also opens and closes the drawer from code, as with [Dialog](/components/dialog#detached-triggers).

```svelte
<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';

	const handle = Drawer.createHandle<{ title: string }>();
</script>

<Drawer.Trigger {handle} payload={{ title: 'Filters' }}>Filters</Drawer.Trigger>

<Drawer.Root {handle}>…</Drawer.Root>
```

### Close from code

`Drawer.Root` renders no element, but it exports `close()` and `unmount()`. Reach them with `bind:this`. `close()` closes the drawer with the reason `imperative-action`. `unmount()` removes the popup at once, without waiting for the exit animation.

## Differences from Base UI

- `open`, `triggerId`, and `snapPoint` are bindable props. Use `bind:open` instead of `open` and `defaultOpen` together. There is no `defaultOpen` prop: pass `open` without `bind:` to set the initial state. `defaultSnapPoint` stays, because the drawer returns to it when it closes.
- A `snapPoint` that is not one of `snapPoints` resolves to the closest snap point, as a controlled snap point does in Base UI.
- `onOpenChange` and `onSnapPointChange` run before the state changes. Call `eventDetails.cancel()` to keep the drawer as it is. Setting `open` or `snapPoint` yourself does not call them.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes and CSS variables below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`.
- `actionsRef` is replaced by `bind:this` on `Drawer.Root`, which exposes `close()` and `unmount()`.
- Events bubble through the DOM, not through the component tree. Content portaled out of a drawer does not reach the drawer's swipe handling.
- Handlers use lowercase names, such as `onclick`. Refs are not supported.

## API reference

### Provider

<ApiPart name="drawer" part="Provider" />

### Indent

<ApiPart name="drawer" part="Indent" />

| Attribute       | Description                                     |
| --------------- | ----------------------------------------------- |
| `data-active`   | Present when a drawer in the provider is open.  |
| `data-inactive` | Present when no drawer in the provider is open. |

| CSS variable              | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `--drawer-swipe-progress` | The frontmost drawer's swipe progress, from `0` to `1`. |
| `--drawer-height`         | The frontmost drawer's height, while a drawer is open.  |

### IndentBackground

<ApiPart name="drawer" part="IndentBackground" />

| Attribute       | Description                                     |
| --------------- | ----------------------------------------------- |
| `data-active`   | Present when a drawer in the provider is open.  |
| `data-inactive` | Present when no drawer in the provider is open. |

### Root

<ApiPart name="drawer" part="Root" />

`Drawer.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="drawer" part="Trigger" />

| Attribute         | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `data-popup-open` | Present when the drawer is open and this trigger opened it. |
| `data-disabled`   | Present when the trigger is disabled.                       |

### SwipeArea

<ApiPart name="drawer" part="SwipeArea" />

| Attribute              | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `data-open`            | Present when the drawer is open.                      |
| `data-closed`          | Present when the drawer is closed.                    |
| `data-swiping`         | Present while a swipe from this area is running.      |
| `data-swipe-direction` | The opening direction: `up`, `down`, `left`, `right`. |
| `data-disabled`        | Present when the swipe area is disabled.              |

### Portal

<ApiPart name="drawer" part="Portal" />

### Backdrop

<ApiPart name="drawer" part="Backdrop" />

| Attribute             | Description                               |
| --------------------- | ----------------------------------------- |
| `data-open`           | Present when the drawer is open.          |
| `data-closed`         | Present when the drawer is closed.        |
| `data-swiping`        | Present while the drawer is swiped.       |
| `data-starting-style` | Present when the drawer is animating in.  |
| `data-ending-style`   | Present when the drawer is animating out. |

| CSS variable              | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `--drawer-swipe-progress` | How far the drawer is swiped toward closed, from `0` to `1`. |

### Viewport

<ApiPart name="drawer" part="Viewport" />

| Attribute             | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `data-open`           | Present when the drawer is open.                     |
| `data-closed`         | Present when the drawer is closed.                   |
| `data-nested`         | Present when the drawer is nested in another dialog. |
| `data-starting-style` | Present when the drawer is animating in.             |
| `data-ending-style`   | Present when the drawer is animating out.            |

| CSS variable              | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `--drawer-keyboard-inset` | The height the software keyboard covers. Set inside `VirtualKeyboardProvider`. |

### Popup

<ApiPart name="drawer" part="Popup" />

| Attribute                    | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `data-open`                  | Present when the drawer is open.                         |
| `data-closed`                | Present when the drawer is closed.                       |
| `data-nested`                | Present when the drawer is nested in another drawer.     |
| `data-nested-drawer-open`    | Present when a drawer nested in this one is open.        |
| `data-nested-drawer-swiping` | Present while a drawer nested in this one is swiped.     |
| `data-expanded`              | Present at the full-height snap point `1`.               |
| `data-swiping`               | Present while the drawer is swiped.                      |
| `data-swipe-dismiss`         | Present while the drawer closes from a swipe.            |
| `data-swipe-direction`       | The dismiss direction: `up`, `down`, `left`, or `right`. |
| `data-starting-style`        | Present when the drawer is animating in.                 |
| `data-ending-style`          | Present when the drawer is animating out.                |

| CSS variable                 | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `--drawer-swipe-movement-x`  | The horizontal swipe movement.                                  |
| `--drawer-swipe-movement-y`  | The vertical swipe movement.                                    |
| `--drawer-snap-point-offset` | How far below its full height the popup sits at the snap point. |
| `--drawer-swipe-strength`    | A scale from 0.1 to 1 for the release transition's duration.    |
| `--drawer-height`            | The popup's height.                                             |
| `--drawer-frontmost-height`  | The height of the frontmost open drawer in the nested stack.    |
| `--nested-drawers`           | The number of open drawers nested in this one.                  |

### Content

<ApiPart name="drawer" part="Content" />

### Title

<ApiPart name="drawer" part="Title" />

### Description

<ApiPart name="drawer" part="Description" />

### Close

<ApiPart name="drawer" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

### VirtualKeyboardProvider

<ApiPart name="drawer" part="VirtualKeyboardProvider" />
