# Dialog

<Subtitle>
  A popup that opens on top of the entire page.
</Subtitle>

<Meta name="description" content="A popup that opens on top of the entire page." />

<DemoDialogHero />

## Usage guidelines

- **Dialog doesn't support gestures:** Use [Drawer](/components/drawer) when you need gesture support or snap points. A panel that slides in from the edge of the screen and doesn't need gesture support is a positioned Dialog.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger />
	<Dialog.Portal>
		<Dialog.Backdrop />
		<Dialog.Viewport>
			<Dialog.Popup>
				<Dialog.Title />
				<Dialog.Description />
				<Dialog.Close />
			</Dialog.Popup>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>
```

## Examples

### State

By default, Dialog is an uncontrolled component that manages its own state.

```svelte title="Uncontrolled dialog"
<Dialog.Root>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup>
			<Dialog.Title>Example dialog</Dialog.Title>
			<Dialog.Close>Close</Dialog.Close>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

Use `bind:open` if you need to access or control the state of the dialog.
For example, you can control the dialog state in order to open it imperatively from another place in your app.

```svelte title="Controlled dialog"
<script lang="ts">
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup>
			<form
				onsubmit={async (event) => {
					event.preventDefault();
					await submitData();
					open = false;
				}}
			>
				...
			</form>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

It's also common to use `onOpenChange` if your app needs to do something when the dialog is closed or opened. This is recommended over `$effect` when reacting to state changes. The callback runs before the state changes, and the binding sets the new state, so there is no setter to call.

```svelte title="Running code when dialog state changes"
<Dialog.Root
	bind:open
	onOpenChange={(nextOpen) => {
		if (!nextOpen) {
			doStuff();
		}
	}}
>
	...
</Dialog.Root>
```

### Open from a menu

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onclick` handler on the menu item. Bind `open` on `<Dialog.Root>` and set it from that handler.

<DemoDialogOpenFromMenu />

### Nested dialogs

You can nest dialogs within one another normally.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

<DemoDialogNested />

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button. Call `eventDetails.cancel()` in that callback to keep the parent dialog open while the confirmation shows.

<DemoDialogCloseConfirmation />

### Custom focus management

You can control where the focus goes when the dialog opens and closes using the `initialFocus` and `finalFocus` props on the `<Dialog.Popup>` component.

You can also set these props to `false` to prevent focus from moving when the dialog opens or closes, or to a function that returns the element to focus based on the interaction type. There is no ref object: pass an element, or a function that returns the element.

<DemoDialogFocusManagement />

### Outside scroll dialog

The dialog can be made scrollable by using `<Dialog.Viewport>` as an outer scrollable container for `<Dialog.Popup>` while the popup can extend past the bottom edge. The scrollable area uses the [Scroll Area component](/components/scroll-area) to provide custom scrollbars.

<DemoDialogOutsideScroll />

### Inside scroll dialog

The dialog can be made scrollable by making an inner container scrollable while the popup stays fully on screen. `<Dialog.Viewport>` is used as a positioning container for `<Dialog.Popup>`, while an inner scrollable area is created using the [Scroll Area component](/components/scroll-area).

<DemoDialogInsideScroll />

### Placing elements outside the popup

When adding elements that should appear "outside" the colored popup area, continue to place them inside `<Dialog.Popup>`, but create a child element that has the popup styles. This ensures they are kept in the tab order and announced correctly by screen readers.

`<Dialog.Popup>` has `pointer-events: none`, while inner content (the colored popup and close button) has `pointer-events: auto` so clicks on the backdrop continue to be registered.

<DemoDialogUncontained />

### Detached triggers

A dialog can be controlled by a trigger located either inside or outside the `<Dialog.Root>` component.
For simple, one-off interactions, place the `<Dialog.Trigger>` inside `<Dialog.Root>`, as shown in the example at the top of this page.

However, if defining the dialog's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Dialog.Trigger>` outside of `<Dialog.Root>` and linking them with a `handle` created by the `Dialog.createHandle()` function.

The imperative methods on the handle, such as `open()` and `openWithPayload()`, require a `<Dialog.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	const demoDialog = Dialog.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoDialog}" -->
<Dialog.Trigger handle={demoDialog}>Open</Dialog.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoDialog}" -->
<Dialog.Root handle={demoDialog}>...</Dialog.Root>
```

<DemoDialogDetachedTriggersSimple />

### Multiple triggers

A single dialog can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Dialog.Trigger>` components inside a single `<Dialog.Root>`.

```svelte title="Multiple triggers within the Root part"
<Dialog.Root>
	<Dialog.Trigger>Trigger 1</Dialog.Trigger>
	<Dialog.Trigger>Trigger 2</Dialog.Trigger>
	...
</Dialog.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	const demoDialog = Dialog.createHandle();
</script>

<Dialog.Trigger handle={demoDialog}>Trigger 1</Dialog.Trigger>
<Dialog.Trigger handle={demoDialog}>Trigger 2</Dialog.Trigger>
<Dialog.Root handle={demoDialog}>...</Dialog.Root>
```

The dialog can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Dialog.Trigger>` and reading it from the `children` snippet of `<Dialog.Root>`, which receives `{ payload }`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	// @highlight
	const demoDialog = Dialog.createHandle<{ text: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Dialog.Trigger handle={demoDialog} payload={{ text: 'Trigger 1' }}>Trigger 1</Dialog.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<Dialog.Trigger handle={demoDialog} payload={{ text: 'Trigger 2' }}>Trigger 2</Dialog.Trigger>

<Dialog.Root handle={demoDialog}>
	<!-- @highlight-text "payload" -->
	{#snippet children({ payload })}
		<Dialog.Portal>
			<Dialog.Popup>
				<Dialog.Title>Dialog</Dialog.Title>
				<!-- @highlight-text "payload" -->
				{#if payload !== undefined}
					<Dialog.Description>
						<!-- @highlight-text "payload" -->
						This has been opened by {payload.text}
					</Dialog.Description>
				{/if}
			</Dialog.Popup>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
```

### Controlled mode with multiple triggers

You can control the dialog's open state externally using the `open` and `onOpenChange` props on `<Dialog.Root>`.
This allows you to manage the dialog's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Dialog.Root>` and the `id` prop on each `<Dialog.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

<DemoDialogDetachedTriggersControlled />

## API reference

<script>
	import { DemoDialogHero } from './demos/hero';
	import { DemoDialogOpenFromMenu } from './demos/open-from-menu';
	import { DemoDialogNested } from './demos/nested';
	import { DemoDialogCloseConfirmation } from './demos/close-confirmation';
	import { DemoDialogFocusManagement } from './demos/focus-management';
	import { DemoDialogOutsideScroll } from './demos/outside-scroll';
	import { DemoDialogInsideScroll } from './demos/inside-scroll';
	import { DemoDialogUncontained } from './demos/uncontained';
	import { DemoDialogDetachedTriggersSimple } from './demos/detached-triggers-simple';
	import { DemoDialogDetachedTriggersControlled } from './demos/detached-triggers-controlled';
	import { TypesDialog } from './types';
</script>

### Root

<TypesDialog.Root />

### Trigger

<TypesDialog.Trigger />

### Portal

<TypesDialog.Portal />

### Backdrop

<TypesDialog.Backdrop />

### Viewport

<TypesDialog.Viewport />

### Popup

<TypesDialog.Popup />

### Title

<TypesDialog.Title />

### Description

<TypesDialog.Description />

### Close

<TypesDialog.Close />

## createHandle

Creates a new handle to connect a `Dialog.Root` with detached `Dialog.Trigger` components.

**Return value**

`Dialog.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a Dialog imperatively and associates detached `Dialog.Trigger` components with a `Dialog.Root`. Create one with `Dialog.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                    |
| --------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the dialog is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the dialog, or the one passed to `openWithPayload()`.   |

**Methods**

| Method            | Parameters                  | Returns | Description                                                                                                                                                                  |
| ----------------- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`            | `triggerId: string \| null` | `void`  | Opens the dialog, optionally associating it with a trigger. This method should only be called in an event handler or an effect (not during rendering).                       |
| `openWithPayload` | `payload: Payload`          | `void`  | Opens the dialog with the given payload, without associating it with any trigger. This method should only be called in an event handler or an effect (not during rendering). |
| `close`           |                             | `void`  | Closes the dialog. This method should only be called in an event handler or an effect (not during rendering).                                                                |
| `unmount`         |                             | `void`  | Removes the popup at once, without waiting for the exit animation.                                                                                                           |
