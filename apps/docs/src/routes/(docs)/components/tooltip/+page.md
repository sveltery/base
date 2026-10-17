# Tooltip

<Subtitle>
  A popup that appears when an element is hovered or focused, showing a hint for sighted users.
</Subtitle>

<Meta name="description" content="A popup that appears when an element is hovered or focused, showing a hint for sighted users." />

<DemoTooltipHero />

## Usage guidelines

- **Prefer using tooltips as visual labels only**: Tooltips should act as supplementary visual labels for sighted mouse and keyboard users. Tooltips alone are not accessible to touch or screen reader users. See [Alternatives to tooltips](#alternatives-to-tooltips) for more details.
- **Provide an accessible name for the trigger**: Tooltips are visual-only elements and are not a replacement for labeling the trigger. The tooltip's trigger must have an `aria-label` attribute that closely matches the tooltip's content to ensure consistency for screen reader users.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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

## Alternatives to tooltips

Tooltips should be supplementary popups that provide non-essential clarity in high-density UIs. A user should not miss critical information if they never see a tooltip.

Tooltips don't work well with touch input. Unlike mouse pointers with hover capability, there's no easily discoverable way to reveal a tooltip before tapping its trigger on a touch device.

iOS doesn't provide a system-standard, touch-friendly tooltip affordance, while Android may show a tooltip on long press. However, on the web, long press is often used to trigger contextual menus in the browser, which can lead to potential conflicts. For this reason, tooltips are disabled on touch devices.

### Infotips

Popups that open when hovering an info icon should use [Popover](/components/popover) with the `openOnHover` prop on the trigger instead of a tooltip. This way, touch users and screen reader users can access the content.

To know when to reach for a popover instead of a tooltip, consider the **purpose** of the trigger element:
If the trigger's purpose is to open the popup itself, it's a popover. If the trigger's purpose is unrelated to opening the popup, it's a tooltip.

### Description text

Tooltips are designed for sighted users and are not a reliable way to deliver important information to touch users or assistive technologies. If the description is important to understanding the element, don't hide it behind a tooltip — use inline text or [Popover](/components/popover) if space is limited, so the information is accessible to everyone.

Since tooltips serve sighted mouse and keyboard users, iconography should clearly communicate the purpose of icon-only triggers, especially on mobile where the text label may not be visible.

If the description is not critical, a tooltip can still be used to provide extra clarity for sighted mouse or keyboard users.

### Contextual feedback messages

Use the Toast component's [anchoring ability](/components/toast#anchored-toasts) for more ergonomic DX, to ensure the message is announced to screen readers, and to support complex content.

## Examples

### Detached triggers

A tooltip can be controlled by a trigger located either inside or outside the `<Tooltip.Root>` component.
For simple, one-off interactions, place the `<Tooltip.Trigger>` inside `<Tooltip.Root>`, as shown in the example at the top of this page.

However, if defining the tooltip's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Tooltip.Trigger>` outside of `<Tooltip.Root>` and linking them with a `handle` created by the `Tooltip.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Tooltip.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const demoTooltip = Tooltip.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoTooltip}" -->
<Tooltip.Trigger handle={demoTooltip}>Button</Tooltip.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoTooltip}" -->
<Tooltip.Root handle={demoTooltip}>...</Tooltip.Root>
```

<DemoTooltipDetachedTriggersSimple />

### Multiple triggers

A single tooltip can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Tooltip.Trigger>` components inside a single `<Tooltip.Root>`.

```svelte title="Multiple triggers within the Root part"
<Tooltip.Root>
	<Tooltip.Trigger>Trigger 1</Tooltip.Trigger>
	<Tooltip.Trigger>Trigger 2</Tooltip.Trigger>
	...
</Tooltip.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const demoTooltip = Tooltip.createHandle();
</script>

<Tooltip.Trigger handle={demoTooltip}>Trigger 1</Tooltip.Trigger>

<Tooltip.Trigger handle={demoTooltip}>Trigger 2</Tooltip.Trigger>

<Tooltip.Root handle={demoTooltip}>...</Tooltip.Root>
```

The tooltip can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Tooltip.Trigger>` and using the `children` snippet of `<Tooltip.Root>`, which receives the `payload`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	// @highlight
	const demoTooltip = Tooltip.createHandle<{ text: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Tooltip.Trigger handle={demoTooltip} payload={{ text: 'Trigger 1' }}>Trigger 1</Tooltip.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Tooltip.Trigger handle={demoTooltip} payload={{ text: 'Trigger 2' }}>Trigger 2</Tooltip.Trigger>

<Tooltip.Root handle={demoTooltip}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<Tooltip.Portal>
			<Tooltip.Positioner sideOffset={8}>
				<Tooltip.Popup>
					<Tooltip.Arrow />
					{#if payload !== undefined}
						<!-- @highlight-text "payload" -->
						<span>Tooltip opened by {payload.text}</span>
						<!-- @highlight-text "payload" -->
					{/if}
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	{/snippet}
</Tooltip.Root>
```

### Controlled mode with multiple triggers

You can control the tooltip's open state externally by binding the `open` prop on `<Tooltip.Root>`.
This allows you to manage the tooltip's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active by binding the `triggerId` prop on `<Tooltip.Root>` and setting the `id` prop on each `<Tooltip.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop. `bind:triggerId` follows the trigger that opens or closes the tooltip.
The `onOpenChange` callback also receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

<DemoTooltipDetachedTriggersControlled />

### Animating the Tooltip

You can animate a tooltip as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the tooltip's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The tooltip also supports content transitions.
This is useful when different triggers display different content within the same tooltip.

To enable content animations, wrap the content in the `<Tooltip.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<Tooltip.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

<DemoTooltipDetachedTriggersFull />

## API reference

<script>
	import { DemoTooltipHero } from './demos/hero';
	import { DemoTooltipDetachedTriggersSimple } from './demos/detached-triggers-simple';
	import { DemoTooltipDetachedTriggersControlled } from './demos/detached-triggers-controlled';
	import { DemoTooltipDetachedTriggersFull } from './demos/detached-triggers-full';
	import { TypesTooltip } from './types';
</script>

### Provider

<TypesTooltip.Provider />

### Root

<TypesTooltip.Root />

### Trigger

<TypesTooltip.Trigger />

### Portal

<TypesTooltip.Portal />

### Positioner

<TypesTooltip.Positioner />

### Popup

<TypesTooltip.Popup />

### Arrow

<TypesTooltip.Arrow />

### Viewport

<TypesTooltip.Viewport />

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

## createHandle

Creates a new handle to connect a `Tooltip.Root` with detached `Tooltip.Trigger` components.

**Return value**

`Tooltip.Handle<Payload>`

[//]: # '@exclude-table-of-contents'

### Handle

Controls a Tooltip imperatively and associates detached `Tooltip.Trigger` components with a `Tooltip.Root`. Create one with `Tooltip.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                     |
| --------- | ---------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the tooltip is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the tooltip.                                             |

**Methods**

| Method    | Parameters                  | Returns | Description                                                                                                                                                                                                                                                                |
| --------- | --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | `triggerId: string \| null` | `void`  | Opens the tooltip and associates it with the trigger with the given id. It throws when no trigger with that id is registered, because the tooltip needs a trigger to anchor to. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                             | `void`  | Closes the tooltip. This method should only be called in an event handler or an effect (not during rendering).                                                                                                                                                             |
| `unmount` |                             | `void`  | Ends the closing phase of the tooltip immediately.                                                                                                                                                                                                                         |
