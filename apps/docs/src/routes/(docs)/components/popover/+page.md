# Popover

<Subtitle>
  An accessible popup anchored to a button.
</Subtitle>

<Meta name="description" content="An accessible popup anchored to a button." />

<DemoPopoverHero />

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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

## Examples

### Opening on hover

This example shows how you can configure the popover to open on hover using the `openOnHover` prop.

You can use the `delay` prop to specify how long to wait (in milliseconds) before the popover opens on hover.

<DemoPopoverOpenOnHover />

### Detached triggers

A popover can be controlled by a trigger located either inside or outside the `<Popover.Root>` component.
For simple, one-off interactions, place the `<Popover.Trigger>` inside `<Popover.Root>`, as shown in the example at the top of this page.

However, if defining the popover's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Popover.Trigger>` outside of `<Popover.Root>` and linking them with a `handle` created by the `Popover.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Popover.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const demoPopover = Popover.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPopover}" -->
<Popover.Trigger handle={demoPopover}>Trigger</Popover.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPopover}" -->
<Popover.Root handle={demoPopover}>...</Popover.Root>
```

<DemoPopoverDetachedTriggersSimple />

### Multiple triggers

A single popover can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Popover.Trigger>` components inside a single `<Popover.Root>`.

```svelte title="Multiple triggers within the Root part"
<Popover.Root>
	<Popover.Trigger>Trigger 1</Popover.Trigger>
	<Popover.Trigger>Trigger 2</Popover.Trigger>
	...
</Popover.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	const demoPopover = Popover.createHandle();
</script>

<Popover.Trigger handle={demoPopover}>Trigger 1</Popover.Trigger>

<Popover.Trigger handle={demoPopover}>Trigger 2</Popover.Trigger>

<Popover.Root handle={demoPopover}>...</Popover.Root>
```

The popover can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Popover.Trigger>` and using the `children` snippet of `<Popover.Root>`, which receives the `payload`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	// @highlight
	const demoPopover = Popover.createHandle<{ text: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 1' }}>Trigger 1</Popover.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 2' }}>Trigger 2</Popover.Trigger>

<Popover.Root handle={demoPopover}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<Popover.Portal>
			<Popover.Positioner sideOffset={8}>
				<Popover.Popup>
					<Popover.Arrow />
					<Popover.Title>Popover</Popover.Title>
					{#if payload !== undefined}
						<!-- @highlight-text "payload" -->
						<Popover.Description>
							This has been opened by {payload.text}
							<!-- @highlight-text "payload" -->
						</Popover.Description>
					{/if}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	{/snippet}
</Popover.Root>
```

### Controlled mode with multiple triggers

You can control the popover's open state externally by binding the `open` prop on `<Popover.Root>`.
This allows you to manage the popover's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active by binding the `triggerId` prop on `<Popover.Root>` and setting the `id` prop on each `<Popover.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop. `bind:triggerId` follows the trigger that opens or closes the popover.
The `onOpenChange` callback also receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

<DemoPopoverDetachedTriggersControlled />

### Animating the Popover

You can animate a popover as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the popover's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The popover also supports content transitions.
This is useful when different triggers display different content within the same popover.

To enable content animations, wrap the content in the `<Popover.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<Popover.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

<DemoPopoverDetachedTriggersFull />

## API reference

<script>
	import { DemoPopoverHero } from './demos/hero';
	import { DemoPopoverOpenOnHover } from './demos/open-on-hover';
	import { DemoPopoverDetachedTriggersSimple } from './demos/detached-triggers-simple';
	import { DemoPopoverDetachedTriggersControlled } from './demos/detached-triggers-controlled';
	import { DemoPopoverDetachedTriggersFull } from './demos/detached-triggers-full';
	import { TypesPopover } from './types';
</script>

### Root

<TypesPopover.Root />

### Trigger

<TypesPopover.Trigger />

### Backdrop

<TypesPopover.Backdrop />

### Portal

<TypesPopover.Portal />

### Positioner

<TypesPopover.Positioner />

### Popup

<TypesPopover.Popup />

### Arrow

<TypesPopover.Arrow />

### Title

<TypesPopover.Title />

### Description

<TypesPopover.Description />

### Close

<TypesPopover.Close />

### Viewport

<TypesPopover.Viewport />

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

## createHandle

Creates a new handle to connect a `Popover.Root` with detached `Popover.Trigger` components.

**Return value**

`Popover.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a Popover imperatively and associates detached `Popover.Trigger` components with a `Popover.Root`. Create one with `Popover.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                     |
| --------- | ---------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the popover is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the popover.                                             |

**Methods**

| Method    | Parameters                  | Returns | Description                                                                                                                                                                                                                                                                |
| --------- | --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | `triggerId: string \| null` | `void`  | Opens the popover and associates it with the trigger with the given id. It throws when no trigger with that id is registered, because the popover needs a trigger to anchor to. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                             | `void`  | Closes the popover. This method should only be called in an event handler or an effect (not during rendering).                                                                                                                                                             |
| `unmount` |                             | `void`  | Ends the closing phase of the popover immediately.                                                                                                                                                                                                                         |
