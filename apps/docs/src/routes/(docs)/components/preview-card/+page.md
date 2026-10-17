# Preview Card

<Subtitle>
  A link that shows a destination preview without interrupting keyboard or screen reader navigation.
</Subtitle>

<Meta name="description" content="A link that shows a destination preview without interrupting keyboard or screen reader navigation." />

<DemoPreviewCardHero />

## Usage guidelines

- **Protect screen reader users' current context**: Exposing each preview to screen readers would force users through its contents before they could continue through the page, repeatedly disrupting their current context. Keep the link as the only accessible interface and include all previewed information at its destination.
- **Keep popup content supplementary**: Avoid placing unique or essential information in the popup unless it is also available on the linked page. For the reason above, preview card content is not touch, keyboard or screen reader navigable. It acts as a visual [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) for sighted mouse and keyboard users only.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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

## Examples

### Detached triggers

A preview card can be controlled by a trigger located either inside or outside the `<PreviewCard.Root>` component.
For simple, one-off interactions, place the `<PreviewCard.Trigger>` inside `<PreviewCard.Root>`, as shown in the example at the top of this page.

However, if defining the preview card's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<PreviewCard.Trigger>` outside of `<PreviewCard.Root>` and linking them with a `handle` created by the `PreviewCard.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<PreviewCard.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPreviewCard}" -->
<PreviewCard.Trigger handle={demoPreviewCard} href="#">Link</PreviewCard.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPreviewCard}" -->
<PreviewCard.Root handle={demoPreviewCard}>...</PreviewCard.Root>
```

<DemoPreviewCardDetachedTriggersSimple />

### Multiple triggers

A single preview card can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<PreviewCard.Trigger>` components inside a single `<PreviewCard.Root>`.

```svelte title="Multiple triggers within the Root part"
<PreviewCard.Root>
	<PreviewCard.Trigger href="#">Trigger 1</PreviewCard.Trigger>
	<PreviewCard.Trigger href="#">Trigger 2</PreviewCard.Trigger>
	...
</PreviewCard.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle();
</script>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">Trigger 1</PreviewCard.Trigger>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">Trigger 2</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>...</PreviewCard.Root>
```

The preview card can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<PreviewCard.Trigger>` and using the `children` snippet of `<PreviewCard.Root>`, which receives the `payload`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	// @highlight
	const demoPreviewCard = PreviewCard.createHandle<{ title: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 1' }} href="#">
	Trigger 1
</PreviewCard.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 2' }} href="#">
	Trigger 2
</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup>
					{#if payload !== undefined}
						<!-- @highlight-text "payload" -->
						<span>Preview card opened by {payload.title}</span>
						<!-- @highlight-text "payload" -->
					{/if}
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	{/snippet}
</PreviewCard.Root>
```

### Controlled mode with multiple triggers

You can control the preview card's open state externally by binding the `open` prop on `<PreviewCard.Root>`.
This allows you to manage the preview card's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active by binding the `triggerId` prop on `<PreviewCard.Root>` and setting the `id` prop on each `<PreviewCard.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop. `bind:triggerId` follows the trigger that opens or closes the preview card.
The `onOpenChange` callback also receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

<DemoPreviewCardDetachedTriggersControlled />

### Animating the Preview Card

You can animate a preview card as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the preview card's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The preview card also supports content transitions.
This is useful when different triggers display different content within the same preview card.

To enable content animations, wrap the content in the `<PreviewCard.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<PreviewCard.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

<DemoPreviewCardDetachedTriggersFull />

## API reference

<script>
	import { DemoPreviewCardHero } from './demos/hero';
	import { DemoPreviewCardDetachedTriggersSimple } from './demos/detached-triggers-simple';
	import { DemoPreviewCardDetachedTriggersControlled } from './demos/detached-triggers-controlled';
	import { DemoPreviewCardDetachedTriggersFull } from './demos/detached-triggers-full';
	import { TypesPreviewCard } from './types';
</script>

### Root

<TypesPreviewCard.Root />

### Trigger

<TypesPreviewCard.Trigger />

### Portal

<TypesPreviewCard.Portal />

### Backdrop

<TypesPreviewCard.Backdrop />

### Positioner

<TypesPreviewCard.Positioner />

### Popup

<TypesPreviewCard.Popup />

### Viewport

<TypesPreviewCard.Viewport />

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

### Arrow

<TypesPreviewCard.Arrow />

## createHandle

Creates a new handle to connect a `PreviewCard.Root` with detached `PreviewCard.Trigger` components.

**Return value**

`PreviewCard.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a PreviewCard imperatively and associates detached `PreviewCard.Trigger` components with a `PreviewCard.Root`. Create one with `PreviewCard.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                          |
| --------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the preview card is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the preview card.                                             |

**Methods**

| Method    | Parameters                  | Returns | Description                                                                                                                                                                                                                                                                          |
| --------- | --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`    | `triggerId: string \| null` | `void`  | Opens the preview card and associates it with the trigger with the given id. It throws when no trigger with that id is registered, because the preview card needs a trigger to anchor to. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                             | `void`  | Closes the preview card. This method should only be called in an event handler or an effect (not during rendering).                                                                                                                                                                  |
| `unmount` |                             | `void`  | Ends the closing phase of the preview card immediately.                                                                                                                                                                                                                              |
