---
title: Alert Dialog
description: A dialog that requires a user response to proceed.
---

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-red-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-gray-800"
	>
		Discard draft
	</AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Backdrop
			class="fixed inset-0 z-50 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
		/>
		<AlertDialog.Popup
			class="fixed top-1/2 left-1/2 z-50 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
		>
			<AlertDialog.Title class="-mt-1.5 mb-1 text-lg font-medium">Discard draft?</AlertDialog.Title>
			<AlertDialog.Description class="mb-6 text-base text-gray-600 dark:text-gray-400">
				You can't undo this action.
			</AlertDialog.Description>
			<div class="flex justify-end gap-4">
				<AlertDialog.Close
					class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
				>
					Cancel
				</AlertDialog.Close>
				<AlertDialog.Close
					class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-base font-medium text-red-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-gray-800"
				>
					Discard
				</AlertDialog.Close>
			</div>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
```

An alert dialog is always modal, and a click outside it does not close it. Escape and a close button still do. The popup has the `alertdialog` role.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger />
	<AlertDialog.Portal>
		<AlertDialog.Backdrop />
		<AlertDialog.Viewport>
			<AlertDialog.Popup>
				<AlertDialog.Title />
				<AlertDialog.Description />
				<AlertDialog.Close />
			</AlertDialog.Popup>
		</AlertDialog.Viewport>
	</AlertDialog.Portal>
</AlertDialog.Root>
```

`AlertDialog.Viewport` is optional. Without it, place the popup directly inside `AlertDialog.Portal`, as in the demo above.

## Examples

### Open state

Bind `open` to read and change whether the alert dialog is open. You can open it from anywhere in your code, such as after a failed request, without a trigger. Without `bind:`, the alert dialog manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	let open = $state(false);
	let reason = $state('none yet');

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<button type="button" class={button} onclick={() => (open = true)}>Sign out</button>
	<p>Last change reason: {reason}</p>
	<AlertDialog.Root
		bind:open
		onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}
	>
		<AlertDialog.Portal>
			<AlertDialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<AlertDialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<AlertDialog.Title class="mb-1 text-lg font-medium">Sign out?</AlertDialog.Title>
				<AlertDialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					Clicking outside does nothing. Press Escape or choose an answer.
				</AlertDialog.Description>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close class={button}>Stay signed in</AlertDialog.Close>
					<AlertDialog.Close class={button}>Sign out</AlertDialog.Close>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</div>
```

The `reason` in the event details is one of `trigger-press`, `escape-key`, `close-press`, `focus-out`, `imperative-action`, or `none`. Assigning `open = true` yourself does not call `onOpenChange`, so the reason above changes only when the alert dialog closes.

### Close confirmation

An alert dialog suits the confirmation step before a destructive close. Call `eventDetails.cancel()` in the `onOpenChange` of a `Dialog` to keep it open, then open an alert dialog with `bind:open`. The confirmation appears whether the user clicks the backdrop, presses Escape, or presses the close button.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Dialog } from '@sveltery/base/dialog';

	let open = $state(false);
	let confirmOpen = $state(false);
	let draft = $state('');

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
	const dangerButton = `${button} text-red-800 dark:text-red-400`;
	const backdrop =
		'fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70';
	const popup =
		'fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700';
</script>

<div class="text-sm">
	<Dialog.Root
		bind:open
		onOpenChange={(next, eventDetails) => {
			if (!next && draft.trim() !== '') {
				eventDetails.cancel();
				confirmOpen = true;
			}
		}}
	>
		<Dialog.Trigger class={button}>New note</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Backdrop class={backdrop} />
			<Dialog.Popup class={popup}>
				<Dialog.Title class="mb-1 text-lg font-medium">New note</Dialog.Title>
				<Dialog.Description class="mb-4 text-gray-600 dark:text-gray-400">
					Closing with unsaved text asks you to confirm.
				</Dialog.Description>
				<textarea
					bind:value={draft}
					placeholder="Write something"
					class="mb-4 h-24 w-full rounded-md border border-gray-200 bg-white p-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
				></textarea>
				<div class="flex justify-end gap-3">
					<Dialog.Close class={button}>Close</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>

	<AlertDialog.Root bind:open={confirmOpen}>
		<AlertDialog.Portal>
			<AlertDialog.Popup class={popup}>
				<AlertDialog.Title class="mb-1 text-lg font-medium">Discard this note?</AlertDialog.Title>
				<AlertDialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					You have unsaved text. It will be lost.
				</AlertDialog.Description>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close class={button}>Keep editing</AlertDialog.Close>
					<button
						type="button"
						class={dangerButton}
						onclick={() => {
							draft = '';
							confirmOpen = false;
							open = false;
						}}
					>
						Discard
					</button>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</div>
```

Assigning `open = false` in your own handler does not call `onOpenChange`, so the discard button above closes the note without the check.

### Detached triggers

A trigger does not have to sit inside `AlertDialog.Root`. Create a handle with `AlertDialog.createHandle()` and pass it to the root and to each trigger as `handle`. The trigger can then live anywhere on the page. A `Dialog.Handle` does not type-check here. Use the alert dialog's own handle.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	const handle = AlertDialog.createHandle();

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
	const dangerButton = `${button} text-red-800 dark:text-red-400`;
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<AlertDialog.Trigger {handle} class={dangerButton}>Delete account</AlertDialog.Trigger>

	<AlertDialog.Root {handle}>
		<AlertDialog.Portal>
			<AlertDialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<AlertDialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<AlertDialog.Title class="mb-1 text-lg font-medium">Delete account?</AlertDialog.Title>
				<AlertDialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					The trigger and the root are siblings that share a handle.
				</AlertDialog.Description>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close class={button}>Cancel</AlertDialog.Close>
					<AlertDialog.Close class={dangerButton}>Delete</AlertDialog.Close>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</div>
```

A handle also controls the alert dialog from code. Call `handle.open(triggerId)`, `handle.close()`, `handle.unmount()`, or `handle.openWithPayload(payload)`. Read `handle.isOpen` and `handle.payload` to inspect it. A handle belongs to one mounted root at a time. Calls made while no root using the handle is mounted are ignored.

### Multiple triggers

Several triggers can open the same alert dialog. Give each trigger a `payload` and read it from `handle.payload`. Type the payload with `AlertDialog.createHandle<T>()`. The alert dialog shows the payload of the trigger that opened it.

Bind `triggerId` next to `open` to know which trigger owns the alert dialog. Give each trigger an `id`. `handle.open(id)` opens the alert dialog as if that trigger had been pressed, with its payload.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	const handle = AlertDialog.createHandle<{ message: string }>();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
	const dangerButton = `${button} text-red-800 dark:text-red-400`;
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Open: {open}. Trigger: {triggerId ?? 'none'}.</p>
	<div class="flex flex-wrap gap-3">
		<AlertDialog.Trigger
			{handle}
			id="discard-trigger"
			payload={{ message: 'Discard draft?' }}
			class={dangerButton}
		>
			Discard
		</AlertDialog.Trigger>
		<AlertDialog.Trigger
			{handle}
			id="delete-trigger"
			payload={{ message: 'Delete project?' }}
			class={dangerButton}
		>
			Delete
		</AlertDialog.Trigger>
		<AlertDialog.Trigger
			{handle}
			id="sign-out-trigger"
			payload={{ message: 'Sign out?' }}
			class={button}
		>
			Sign out
		</AlertDialog.Trigger>
		<button type="button" class={button} onclick={() => handle.open('delete-trigger')}>
			Open from code
		</button>
	</div>

	<AlertDialog.Root {handle} bind:open bind:triggerId>
		<AlertDialog.Portal>
			<AlertDialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<AlertDialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<AlertDialog.Title class="mb-1 text-lg font-medium">
					{handle.payload?.message ?? 'Are you sure?'}
				</AlertDialog.Title>
				<AlertDialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					This action cannot be undone.
				</AlertDialog.Description>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close class={button}>Cancel</AlertDialog.Close>
					<AlertDialog.Close class={dangerButton}>Confirm</AlertDialog.Close>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</div>
```

You can also put several triggers inside one `AlertDialog.Root` without a handle. Each trigger still takes its own `payload`, and the snippet you pass as the children of `AlertDialog.Root` receives it as `{ payload }`. Without a handle, that snippet argument is typed `unknown`, so narrow it yourself. With a handle, it has the handle's payload type.

```svelte
<AlertDialog.Root>
	{#snippet children({ payload })}
		<AlertDialog.Trigger payload="draft">Discard draft</AlertDialog.Trigger>
		<AlertDialog.Trigger payload="project">Delete project</AlertDialog.Trigger>
		<AlertDialog.Portal>
			<AlertDialog.Popup>
				<AlertDialog.Title>
					{payload === 'draft' ? 'Discard draft?' : 'Delete project?'}
				</AlertDialog.Title>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	{/snippet}
</AlertDialog.Root>
```

### Close from code

`AlertDialog.Root` renders no element, but it exports `close()` and `unmount()`. Reach them with `bind:this`. `close()` closes the alert dialog with the reason `imperative-action`. `unmount()` removes the popup at once, without waiting for the exit animation.

```svelte
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	let alertDialog = $state<ReturnType<typeof AlertDialog.Root>>();
</script>

<AlertDialog.Root bind:this={alertDialog}>…</AlertDialog.Root>
```

## Differences from Base UI

- `AlertDialog.Root` is `Dialog.Root` with `modal` fixed to `true` and outside presses disabled. It has no `modal` or `disablePointerDismissal` prop. Every part other than `Root` and `Trigger` is the `Dialog` part, and its prop types are exported under `AlertDialog*` names, such as `AlertDialogPopupProps`.
- `open` and `triggerId` are bindable props. Use `bind:open` and `bind:triggerId` instead of `open`, `defaultOpen`, `triggerId`, and `defaultTriggerId` together. There are no `defaultOpen` or `defaultTriggerId` props: pass `open` or `triggerId` without `bind:` to set the initial state.
- `onOpenChange` runs before the state changes. Call `eventDetails.cancel()` to keep the alert dialog as it is. Setting `open` yourself does not call it.
- `AlertDialog.Trigger` and `AlertDialog.Root` take an `AlertDialog.Handle`. A `Dialog.Handle` does not type-check. Handle warnings name `Dialog.Handle`, as upstream's do.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `AlertDialog.Root` renders no element, so it has no `render`.
- The `AlertDialog.Root` children snippet receives `{ payload }`, where React passes a render function.
- `actionsRef` is replaced by `bind:this` on `AlertDialog.Root`, which exposes `close()` and `unmount()`.
- The data attribute and CSS variable namespaces, such as `AlertDialogPopupDataAttributes`, are not exported. The tables below list them.
- Handlers use lowercase names, such as `onclick`. Refs are not supported.

## API reference

### Root

<ApiPart name="alert-dialog" part="Root" />

`AlertDialog.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="alert-dialog" part="Trigger" />

`AlertDialog.Trigger` renders [`Dialog.Trigger`](/components/dialog#trigger) and takes an `AlertDialog.Handle`.

| Attribute         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `data-popup-open` | Present when the alert dialog is open and this trigger opened it. |
| `data-disabled`   | Present when the trigger is disabled.                             |

### Portal

<ApiPart name="alert-dialog" part="Portal" />

### Backdrop

<ApiPart name="alert-dialog" part="Backdrop" />

| Attribute             | Description                                     |
| --------------------- | ----------------------------------------------- |
| `data-open`           | Present when the alert dialog is open.          |
| `data-closed`         | Present when the alert dialog is closed.        |
| `data-starting-style` | Present when the alert dialog is animating in.  |
| `data-ending-style`   | Present when the alert dialog is animating out. |

### Viewport

<ApiPart name="alert-dialog" part="Viewport" />

| Attribute                 | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `data-open`               | Present when the alert dialog is open.                     |
| `data-closed`             | Present when the alert dialog is closed.                   |
| `data-nested`             | Present when the alert dialog is nested in another dialog. |
| `data-nested-dialog-open` | Present when a dialog nested in this one is open.          |
| `data-starting-style`     | Present when the alert dialog is animating in.             |
| `data-ending-style`       | Present when the alert dialog is animating out.            |

### Popup

<ApiPart name="alert-dialog" part="Popup" />

| Attribute                 | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `data-open`               | Present when the alert dialog is open.                     |
| `data-closed`             | Present when the alert dialog is closed.                   |
| `data-nested`             | Present when the alert dialog is nested in another dialog. |
| `data-nested-dialog-open` | Present when a dialog nested in this one is open.          |
| `data-starting-style`     | Present when the alert dialog is animating in.             |
| `data-ending-style`       | Present when the alert dialog is animating out.            |

| CSS variable       | Description                                    |
| ------------------ | ---------------------------------------------- |
| `--nested-dialogs` | The number of open dialogs nested in this one. |

### Title

<ApiPart name="alert-dialog" part="Title" />

### Description

<ApiPart name="alert-dialog" part="Description" />

### Close

<ApiPart name="alert-dialog" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |
