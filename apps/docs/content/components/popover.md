---
title: Popover
description: An accessible popup anchored to a button.
---

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800"
	>
		Notifications
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-6 py-4 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Popover.Arrow
					class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.5 data-[side=left]:rotate-90 data-[side=right]:-left-3.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
				>
					<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
						<path
							d="M0 10L10 1L20 10"
							class="fill-gray-50 stroke-gray-200 dark:fill-gray-900 dark:stroke-gray-700"
						/>
					</svg>
				</Popover.Arrow>
				<Popover.Title class="text-base font-medium">Notifications</Popover.Title>
				<Popover.Description class="text-base text-gray-600 dark:text-gray-400">
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger />
	<Popover.Portal>
		<Popover.Backdrop />
		<Popover.Positioner>
			<Popover.Popup>
				<Popover.Arrow />
				<Popover.Viewport>
					<Popover.Title />
					<Popover.Description />
					<Popover.Close />
				</Popover.Viewport>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

`Popover.Backdrop` and `Popover.Viewport` are optional. `Popover.Positioner` and `Popover.Popup` are required.

## Examples

### Open state

Bind `open` to read and change whether the popover is open. Without `bind:`, the popover manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	let open = $state(false);
	let reason = $state('none yet');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={open} />
		Open from outside
	</label>
	<p>Last change reason: {reason}</p>
	<Popover.Root bind:open onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}>
		<Popover.Trigger
			class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			Toggle popover
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner sideOffset={8}>
				<Popover.Popup
					class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-4 py-3 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Popover.Description>Press Escape or click outside to close.</Popover.Description>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
</div>
```

The `reason` in the event details is one of `trigger-press`, `trigger-hover`, `trigger-focus`, `outside-press`, `escape-key`, `close-press`, `focus-out`, `imperative-action`, or `none`.

### Open on hover

Set `openOnHover` on the trigger to open the popover when the pointer rests on it. Use `delay` for the wait before it opens and `closeDelay` for the wait before it closes. Both are in milliseconds. `delay` defaults to 300 and `closeDelay` defaults to 0. Clicking the trigger still opens the popover.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
</script>

<Popover.Root>
	<Popover.Trigger
		openOnHover
		delay={100}
		closeDelay={100}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Hover me
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Popover.Description>Opened by hover.</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Side and alignment

`Popover.Positioner` places the popup next to the trigger. Set `side` to choose the edge of the trigger and `align` to choose how the popup lines up along that edge. `side` is `top`, `bottom`, `left`, `right`, `inline-start`, or `inline-end`, and defaults to `bottom`. `align` is `start`, `center`, or `end`, and defaults to `center`. `sideOffset` and `alignOffset` move the popup away from the trigger, in pixels or with a function.

If the popup does not fit on the chosen side, it flips to the opposite side. The rendered side and alignment are in the `data-side` and `data-align` attributes, which the positioner, the popup, and the arrow all set. In this demo, choose a side and an alignment inside the popup.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	type Side = 'top' | 'bottom' | 'left' | 'right';
	type Align = 'start' | 'center' | 'end';

	let side = $state<Side>('right');
	let align = $state<Align>('center');

	const select =
		'rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100';
</script>

<Popover.Root>
	<Popover.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Placement
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner {side} {align} sideOffset={10}>
			<Popover.Popup
				class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 p-4 text-sm text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Popover.Arrow
					class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.5 data-[side=left]:rotate-90 data-[side=right]:-left-3.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
				>
					<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
						<path
							d="M0 10L10 1L20 10"
							class="fill-gray-50 stroke-gray-200 dark:fill-gray-900 dark:stroke-gray-700"
						/>
					</svg>
				</Popover.Arrow>
				<div class="flex flex-col gap-3">
					<label class="flex items-center justify-between gap-4">
						Side
						<select bind:value={side} class={select}>
							<option>top</option>
							<option>bottom</option>
							<option>left</option>
							<option>right</option>
						</select>
					</label>
					<label class="flex items-center justify-between gap-4">
						Align
						<select bind:value={align} class={select}>
							<option>start</option>
							<option>center</option>
							<option>end</option>
						</select>
					</label>
				</div>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

### Arrow

Render `Popover.Arrow` inside `Popover.Popup`. The positioner places the arrow on the edge that faces the trigger and keeps it centered on the trigger. The arrow sets `data-side` to the side of the trigger the popup is on, so use it to rotate and offset your arrow graphic. `data-uncentered` is present when the popup shifted so far that the arrow can no longer point at the middle of the trigger. Set `arrowPadding` on the positioner to keep the arrow that many pixels from the popup's corners.

The first demo on this page shows an arrow with the usual styles:

```svelte
<Popover.Arrow
	class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.5 data-[side=left]:rotate-90 data-[side=right]:-left-3.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
>
	<svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
		<path d="M0 10L10 1L20 10" />
	</svg>
</Popover.Arrow>
```

### Modal popovers

Set `modal` to `true` to lock page scroll and block pointer interaction outside the popover while it is open. Render `Popover.Backdrop` to dim the page behind it. Set `modal="trap-focus"` to trap focus without locking scroll or blocking outside pointers.

```svelte
<Popover.Root modal>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Portal>
		<Popover.Backdrop class="fixed inset-0" />
		<Popover.Positioner>
			<Popover.Popup>…</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
```

A popover opened by hover ignores `modal`.

### Close button

`Popover.Close` closes the popover when pressed. A modal popover traps focus only when its popup renders a `Popover.Close`, so a keyboard user always has a way out.

```svelte
<Popover.Popup>
	<Popover.Title>Share</Popover.Title>
	<Popover.Close>Done</Popover.Close>
</Popover.Popup>
```

### Detached triggers

A trigger does not have to sit inside `Popover.Root`. Create a handle with `Popover.createHandle()` and pass it to the root and to each trigger as `handle`. The trigger can then live anywhere on the page.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const handle = Popover.createHandle();
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Popover.Trigger
		{handle}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
	>
		Detached trigger
	</Popover.Trigger>

	<Popover.Root {handle}>
		<Popover.Portal>
			<Popover.Positioner sideOffset={8}>
				<Popover.Popup
					class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-4 py-3 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Popover.Description>The trigger and the root share a handle.</Popover.Description>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
</div>
```

A handle also controls the popover from code. Call `handle.open(triggerId)`, `handle.close()`, or `handle.unmount()`. Read `handle.isOpen` and `handle.payload` to inspect it. `handle.open(triggerId)` throws when no trigger with that id is registered, because the popover needs a trigger to anchor to.

### Multiple triggers

Several triggers can open the same popover. Give each trigger a `payload` and read it from `handle.payload`. Type the payload with `Popover.createHandle<T>()`. The popover moves to the trigger that opened it and shows that trigger's payload.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const handle = Popover.createHandle<{ title: string; body: string }>();

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Popover.Trigger
		{handle}
		payload={{ title: 'Notifications', body: 'You have 3 unread messages.' }}
		class={button}
	>
		Notifications
	</Popover.Trigger>
	<Popover.Trigger
		{handle}
		payload={{ title: 'Activity', body: 'Your last sign-in was this morning.' }}
		class={button}
	>
		Activity
	</Popover.Trigger>
	<Popover.Trigger
		{handle}
		payload={{ title: 'Profile', body: 'Your profile is 80 percent complete.' }}
		class={button}
	>
		Profile
	</Popover.Trigger>

	<Popover.Root {handle}>
		<Popover.Portal>
			<Popover.Positioner sideOffset={8}>
				<Popover.Popup
					class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-6 py-4 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Popover.Title class="text-base font-medium">{handle.payload?.title}</Popover.Title>
					<Popover.Description class="text-gray-600 dark:text-gray-400">
						{handle.payload?.body}
					</Popover.Description>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
</div>
```

You can also put several triggers inside one `Popover.Root` without a handle. Each trigger still takes its own `payload`, and the snippet you pass as the children of `Popover.Root` receives it as `{ payload }`. That snippet argument is typed `unknown`, so narrow it yourself.

### Controlled mode with multiple triggers

Bind `triggerId` next to `open` to know which trigger owns the popover. Give each trigger an `id`. The `eventDetails.trigger` property of `onOpenChange` is the trigger element that caused the change.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Open: {open}. Trigger: {triggerId ?? 'none'}.</p>
	<Popover.Root bind:open bind:triggerId>
		<div class="flex gap-3">
			<Popover.Trigger id="trigger-a" class={button}>Trigger A</Popover.Trigger>
			<Popover.Trigger id="trigger-b" class={button}>Trigger B</Popover.Trigger>
		</div>
		<Popover.Portal>
			<Popover.Positioner sideOffset={8}>
				<Popover.Popup
					class="origin-[var(--transform-origin)] rounded-lg bg-gray-50 px-4 py-3 text-gray-900 shadow-lg outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Popover.Description>Opened by {triggerId}.</Popover.Description>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
</div>
```

### Animate the popover

With several triggers, the positioner moves from one trigger to the next. Transition the positioner's `top`, `left`, `right`, and `bottom` to animate that move, and transition the popup's `width` and `height` from `--popup-width` and `--popup-height` to animate the size change.

Wrap the content in `Popover.Viewport` to cross-fade it. While the viewport animates, it renders the content of the previous trigger in an element with `data-previous` and the new content in an element with `data-current`. It sets `data-activation-direction` to where the new trigger sits relative to the old one, such as `left` or `right down`, and sets `data-transitioning` while the previous content is on screen.

```svelte demo
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const handle = Popover.createHandle<{ title: string; body: string }>();

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:data-[popup-open]:bg-gray-800';
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Popover.Trigger
		{handle}
		payload={{ title: 'Notifications', body: 'You have 3 unread messages.' }}
		class={button}
	>
		Notifications
	</Popover.Trigger>
	<Popover.Trigger
		{handle}
		payload={{
			title: 'Activity',
			body: 'Your last sign-in was this morning, and your password changed last week.'
		}}
		class={button}
	>
		Activity
	</Popover.Trigger>
	<Popover.Trigger
		{handle}
		payload={{ title: 'Profile', body: 'Your profile is 80 percent complete.' }}
		class={button}
	>
		Profile
	</Popover.Trigger>

	<Popover.Root {handle}>
		<Popover.Portal>
			<Popover.Positioner
				sideOffset={8}
				class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-300 ease-out data-[instant]:transition-none"
			>
				<Popover.Popup
					class="relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] rounded-lg bg-gray-50 text-gray-900 shadow-lg outline outline-gray-200 transition-[width,height,opacity,scale] duration-300 ease-out data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Popover.Viewport
						class="relative h-full w-full overflow-clip px-6 py-4 [&_[data-current]]:w-[var(--popup-width,auto)] [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-300 [&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~=left]:[&_[data-current][data-starting-style]]:-translate-x-1/3 data-[activation-direction~=right]:[&_[data-current][data-starting-style]]:translate-x-1/3 [&_[data-previous]]:w-[var(--popup-width,auto)] [&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-300 [&_[data-previous][data-ending-style]]:opacity-0 data-[activation-direction~=left]:[&_[data-previous][data-ending-style]]:translate-x-1/3 data-[activation-direction~=right]:[&_[data-previous][data-ending-style]]:-translate-x-1/3"
					>
						<Popover.Title class="text-base font-medium">{handle.payload?.title}</Popover.Title>
						<Popover.Description class="max-w-56 text-gray-600 dark:text-gray-400">
							{handle.payload?.body}
						</Popover.Description>
					</Popover.Viewport>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
</div>
```

## Differences from Base UI

- `open` and `triggerId` are bindable props. Use `bind:open` and `bind:triggerId` instead of `open`, `defaultOpen`, `triggerId`, and `defaultTriggerId` together. There are no `defaultOpen` or `defaultTriggerId` props: pass `open` or `triggerId` without `bind:` to set the initial state. Only form controls keep `defaultValue` and `defaultChecked`.
- `onOpenChange` runs before the state changes. Call `eventDetails.cancel()` to keep the popover as it is. Setting `open` yourself does not call it.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Popover.Root` renders no element, so it has no `render`. `Popover.Title`, `Popover.Description`, and `Popover.Close` receive an empty state object.
- The `Popover.Root` children snippet receives `{ payload }`, where React passes a render function.
- `actionsRef` is not available. Use `bind:this` on `Popover.Root`, which exposes `close()` and `unmount()`.
- `initialFocus` and `finalFocus` take an element, a boolean, or a function that receives how the popover opened or closed. They do not take ref objects.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in a handler on `Popover.Trigger` or `Popover.Close` to skip its own handling.
- `Popover.Portal` renders a `div` that keeps `data-base-ui-portal` even if you pass your own value. A `container` of `null` does not mount the popover until you set an element or shadow root.
- The previous content that `Popover.Viewport` cross-fades is a copy of the live content. Each copied form control loses its `name` and gets an empty `form` attribute, so the copy is never submitted, never unchecks a live radio, and never blocks the surrounding form. A new trigger starts from its own content state.
- Nesting a popover inside a Menu or Combobox is not available yet. Refs are not supported.

## API reference

### Root

<ApiPart name="popover" part="Root" />

`Popover.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="popover" part="Trigger" />

| Attribute         | Description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `data-popup-open` | Present when the popover is open and this trigger opened it.              |
| `data-pressed`    | Present when the popover is open and was opened by pressing this trigger. |
| `data-disabled`   | Present when the trigger is disabled.                                     |

### Portal

<ApiPart name="popover" part="Portal" />

### Backdrop

<ApiPart name="popover" part="Backdrop" />

| Attribute             | Description                                |
| --------------------- | ------------------------------------------ |
| `data-open`           | Present when the popover is open.          |
| `data-closed`         | Present when the popover is closed.        |
| `data-starting-style` | Present when the popover is animating in.  |
| `data-ending-style`   | Present when the popover is animating out. |

### Positioner

<ApiPart name="popover" part="Positioner" />

Without props, the positioner places the popup below the trigger and centers it. `side` defaults to `bottom`, `align` to `center`, `sideOffset` and `alignOffset` to `0`, `collisionPadding` to `5`, and `arrowPadding` to `5`. `anchor` defaults to the trigger that opened the popover. `positionMethod` defaults to `absolute`, and `collisionBoundary` defaults to the clipping ancestors of the popup. `sticky` and `disableAnchorTracking` default to `false`. By default, the popup flips to the opposite side when it does not fit on the chosen side.

| Attribute            | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `data-open`          | Present when the popover is open.                                                      |
| `data-closed`        | Present when the popover is closed.                                                    |
| `data-anchor-hidden` | Present when the trigger is hidden or clipped, so the popover has nothing to point at. |
| `data-side`          | The side of the trigger the popover is on after collisions.                            |
| `data-align`         | How the popover lines up with the trigger after collisions.                            |
| `data-instant`       | Present when the popover moves or opens without a transition.                          |

| CSS variable          | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `--anchor-width`      | The width of the trigger.                                                      |
| `--anchor-height`     | The height of the trigger.                                                     |
| `--available-width`   | The width between the trigger and the edge of the boundary.                    |
| `--available-height`  | The height between the trigger and the edge of the boundary.                   |
| `--positioner-width`  | The width of the positioner.                                                   |
| `--positioner-height` | The height of the positioner.                                                  |
| `--transform-origin`  | The point on the popover that the trigger is closest to, for scale animations. |

### Popup

<ApiPart name="popover" part="Popup" />

| Attribute             | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `data-open`           | Present when the popover is open.                             |
| `data-closed`         | Present when the popover is closed.                           |
| `data-side`           | The side of the trigger the popover is on after collisions.   |
| `data-align`          | How the popover lines up with the trigger after collisions.   |
| `data-instant`        | Present when the popover opens or moves without a transition. |
| `data-starting-style` | Present when the popover is animating in.                     |
| `data-ending-style`   | Present when the popover is animating out.                    |

| CSS variable     | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `--popup-width`  | The width of the popup, while `Popover.Viewport` animates a size change.  |
| `--popup-height` | The height of the popup, while `Popover.Viewport` animates a size change. |

### Arrow

<ApiPart name="popover" part="Arrow" />

| Attribute         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `data-open`       | Present when the popover is open.                                 |
| `data-closed`     | Present when the popover is closed.                               |
| `data-side`       | The side of the trigger the popover is on after collisions.       |
| `data-align`      | How the popover lines up with the trigger after collisions.       |
| `data-uncentered` | Present when the arrow cannot point at the center of the trigger. |

### Title

<ApiPart name="popover" part="Title" />

### Description

<ApiPart name="popover" part="Description" />

### Close

<ApiPart name="popover" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

### Viewport

<ApiPart name="popover" part="Viewport" />

| Attribute                   | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `data-activation-direction` | Where the new trigger sits relative to the previous one, such as `left` or `right down`. |
| `data-transitioning`        | Present while the previous content is on screen.                                         |
| `data-instant`              | Present when the content changes without a transition.                                   |
