---
title: Dialog
description: A popup that opens on top of the entire page.
---

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		View notifications
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 z-50 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 z-50 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
		>
			<Dialog.Title class="-mt-1.5 mb-1 text-lg font-medium">Notifications</Dialog.Title>
			<Dialog.Description class="mb-6 text-base text-gray-600 dark:text-gray-400">
				You are all caught up. Good job!
			</Dialog.Description>
			<div class="flex justify-end gap-4">
				<Dialog.Close
					class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
				>
					Close
				</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte
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

`Dialog.Viewport` is optional. Without it, place the popup directly inside `Dialog.Portal`, as in the demo above.

## Examples

### Open state

Bind `open` to read and change whether the dialog is open. Without `bind:`, the dialog manages its own state, and a value you pass sets the initial state. The `onOpenChange` callback runs before every change and tells you why it happened.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let open = $state(false);
	let reason = $state('none yet');
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={open} />
		Open from outside
	</label>
	<p>Last change reason: {reason}</p>
	<Dialog.Root bind:open onOpenChange={(_open, eventDetails) => (reason = eventDetails.reason)}>
		<Dialog.Trigger
			class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			Open dialog
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<Dialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Dialog.Title class="mb-1 text-lg font-medium">Controlled dialog</Dialog.Title>
				<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					Press Escape, click outside, or use the button to close it.
				</Dialog.Description>
				<div class="flex justify-end">
					<Dialog.Close
						class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						Close
					</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
</div>
```

The `reason` in the event details is one of `trigger-press`, `outside-press`, `escape-key`, `close-press`, `focus-out`, `imperative-action`, or `none`.

### Close from code

`Dialog.Root` renders no element, but it exports `close()` and `unmount()`. Reach them with `bind:this`. `close()` closes the dialog as if the user pressed a close button. `unmount()` removes the popup at once, without waiting for the exit animation. In this demo, the dialog closes itself after three seconds.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let dialog = $state<ReturnType<typeof Dialog.Root>>();
</script>

<Dialog.Root bind:this={dialog}>
	<Dialog.Trigger
		onclick={() => setTimeout(() => dialog?.close(), 3000)}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Open for three seconds
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 z-50 w-80 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
		>
			<Dialog.Title class="mb-1 text-lg font-medium">Closing soon</Dialog.Title>
			<Dialog.Description class="text-gray-600 dark:text-gray-400">
				This dialog closes itself.
			</Dialog.Description>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Nested dialogs

Place a `Dialog.Root` inside a dialog's popup to open a second dialog. A nested dialog does not render its backdrop, so the page stays dimmed once. The parent popup sets `data-nested-dialog-open` while a child is open, and the popup sets `--nested-dialogs` to the number of open nested dialogs. Use both to scale the parent back.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Open nested dialogs
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 translate-y-[calc(-50%+var(--nested-dialogs)*-1.5rem)] scale-[calc(1-var(--nested-dialogs)*0.05)] rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:inset-0 data-[nested-dialog-open]:after:rounded-lg data-[nested-dialog-open]:after:bg-black/5 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
		>
			<Dialog.Title class="mb-1 text-lg font-medium">Parent dialog</Dialog.Title>
			<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
				Open a dialog from inside this one.
			</Dialog.Description>
			<div class="flex justify-between gap-4">
				<Dialog.Root>
					<Dialog.Trigger
						class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						Open nested
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup
							class="fixed top-1/2 left-1/2 z-50 w-80 max-w-[calc(100vw-3rem)] -translate-x-1/2 translate-y-[calc(-50%+var(--nested-dialogs)*-1.5rem)] scale-[calc(1-var(--nested-dialogs)*0.05)] rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
						>
							<Dialog.Title class="mb-1 text-lg font-medium">Nested dialog</Dialog.Title>
							<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
								Escape closes this dialog first.
							</Dialog.Description>
							<div class="flex justify-end">
								<Dialog.Close
									class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
								>
									Close
								</Dialog.Close>
							</div>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
				<Dialog.Close
					class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
				>
					Close all
				</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

While a nested dialog is open, Escape and outside presses close only the nested dialog.

Set `forceRender` on a nested `Dialog.Backdrop` to render it anyway.

### Close confirmation

Call `eventDetails.cancel()` in `onOpenChange` to keep a dialog open. This demo asks for confirmation before it discards a draft. The confirmation is a second dialog whose state you control with `bind:open`.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let open = $state(false);
	let confirmOpen = $state(false);
	let draft = $state('');

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
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

	<Dialog.Root bind:open={confirmOpen}>
		<Dialog.Portal>
			<Dialog.Popup class={popup}>
				<Dialog.Title class="mb-1 text-lg font-medium">Discard this note?</Dialog.Title>
				<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					You have unsaved text. It will be lost.
				</Dialog.Description>
				<div class="flex justify-end gap-3">
					<Dialog.Close class={button}>Keep editing</Dialog.Close>
					<button
						type="button"
						class={button}
						onclick={() => {
							draft = '';
							confirmOpen = false;
							open = false;
						}}
					>
						Discard
					</button>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
</div>
```

Assigning `open = false` in your own handler does not call `onOpenChange`, so the discard button above closes the first dialog without the check.

### Custom focus management

By default, the dialog focuses its first focusable element when it opens. On touch devices it focuses the popup itself, so the virtual keyboard stays closed. When it closes, it returns focus to the trigger. `initialFocus` and `finalFocus` take an element, a boolean, or a function that receives how the dialog opened or closed. There is no ref object. Return the element from a function instead.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let nameInput = $state<HTMLInputElement | null>(null);
	let afterButton = $state<HTMLButtonElement | null>(null);

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Dialog.Root>
		<Dialog.Trigger class={button}>Edit profile</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<Dialog.Popup
				initialFocus={() => nameInput}
				finalFocus={() => afterButton}
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Dialog.Title class="mb-4 text-lg font-medium">Edit profile</Dialog.Title>
				<div class="mb-4 flex gap-2">
					<Dialog.Close class={button}>Cancel</Dialog.Close>
					<input
						bind:this={nameInput}
						placeholder="Name"
						class="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
					/>
				</div>
				<Dialog.Description class="text-gray-600 dark:text-gray-400">
					Focus starts in the name field and returns to the button on the right.
				</Dialog.Description>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
	<button bind:this={afterButton} type="button" class={button}>Focus lands here</button>
</div>
```

Pass `false` to `initialFocus` to leave focus where it is. Pass `false` to `finalFocus` to skip returning focus. A `finalFocus` function that returns `null` focuses the trigger. A `finalFocus` of `null` returns no focus.

### Scrolling with the viewport

`Dialog.Viewport` is a full-screen container around the popup. Make it the scroll container so a tall popup scrolls with the page.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Open long dialog
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
		/>
		<Dialog.Viewport class="fixed inset-0 z-50 overflow-y-auto">
			<div class="flex min-h-full items-center justify-center p-4">
				<Dialog.Popup
					class="relative w-96 max-w-full rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
				>
					<Dialog.Title class="mb-1 text-lg font-medium">Terms of service</Dialog.Title>
					<Dialog.Description class="mb-4 text-gray-600 dark:text-gray-400">
						Scroll the page to read all of it.
					</Dialog.Description>
					{#each { length: 12 } as _, index (index)}
						<p class="mb-3 text-sm text-gray-700 dark:text-gray-300">
							Section {index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua.
						</p>
					{/each}
					<div class="flex justify-end">
						<Dialog.Close
							class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
						>
							Close
						</Dialog.Close>
					</div>
				</Dialog.Popup>
			</div>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>
```

To scroll only the content inside the popup, size the popup to the viewport, for example with `max-h-[calc(100dvh-4rem)]`, and set `overflow-y-auto` on an element inside it.

### Detached triggers

A trigger does not have to sit inside `Dialog.Root`. Create a handle with `Dialog.createHandle()` and pass it to the root and to each trigger as `handle`. The trigger can then live anywhere on the page.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	const handle = Dialog.createHandle();
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Dialog.Trigger
		{handle}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
	>
		Open from a detached trigger
	</Dialog.Trigger>

	<Dialog.Root {handle}>
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<Dialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Dialog.Title class="mb-1 text-lg font-medium">Detached trigger</Dialog.Title>
				<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					The trigger and the root are siblings that share a handle.
				</Dialog.Description>
				<div class="flex justify-end">
					<Dialog.Close
						class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						Close
					</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
</div>
```

A handle also controls the dialog from code. Call `handle.open(triggerId)`, `handle.close()`, `handle.unmount()`, or `handle.openWithPayload(payload)`. Read `handle.isOpen` and `handle.payload` to inspect it. A handle belongs to one mounted root at a time.

### Multiple triggers

Several triggers can open the same dialog. Give each trigger a `payload` and read it from `handle.payload`. Type the payload with `Dialog.createHandle<T>()`. The dialog shows the payload of the trigger that opened it.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	const handle = Dialog.createHandle<{ title: string; body: string }>();

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
	<Dialog.Trigger
		{handle}
		payload={{ title: 'Notifications', body: 'You have 3 unread messages.' }}
		class={button}
	>
		Notifications
	</Dialog.Trigger>
	<Dialog.Trigger
		{handle}
		payload={{ title: 'Activity', body: 'Your last sign-in was this morning.' }}
		class={button}
	>
		Activity
	</Dialog.Trigger>
	<Dialog.Trigger
		{handle}
		payload={{ title: 'Profile', body: 'Your profile is 80 percent complete.' }}
		class={button}
	>
		Profile
	</Dialog.Trigger>

	<Dialog.Root {handle}>
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<Dialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Dialog.Title class="mb-1 text-lg font-medium">{handle.payload?.title}</Dialog.Title>
				<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					{handle.payload?.body}
				</Dialog.Description>
				<div class="flex justify-end">
					<Dialog.Close class={button}>Close</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
</div>
```

You can also put several triggers inside one `Dialog.Root` without a handle. Each trigger still takes its own `payload`, and the snippet you pass as the children of `Dialog.Root` receives it as `{ payload }`. Without a handle, that snippet argument is typed `unknown`, so narrow it yourself. With a handle, it has the handle's payload type.

### Controlled mode with multiple triggers

Bind `triggerId` next to `open` to know which trigger owns the dialog. Give each trigger an `id`. The `eventDetails.trigger` property of `onOpenChange` is the trigger element that caused the change.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-start gap-3 text-sm text-gray-900 dark:text-gray-100">
	<p>Open: {open}. Trigger: {triggerId ?? 'none'}.</p>
	<Dialog.Root bind:open bind:triggerId>
		<div class="flex gap-3">
			<Dialog.Trigger id="trigger-a" class={button}>Trigger A</Dialog.Trigger>
			<Dialog.Trigger id="trigger-b" class={button}>Trigger B</Dialog.Trigger>
		</div>
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 z-50 bg-black opacity-20 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70"
			/>
			<Dialog.Popup
				class="fixed top-1/2 left-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-gray-900 dark:text-gray-100 dark:outline-gray-700"
			>
				<Dialog.Title class="mb-1 text-lg font-medium">Opened by {triggerId}</Dialog.Title>
				<Dialog.Description class="mb-6 text-gray-600 dark:text-gray-400">
					Focus returns to the trigger that opened this dialog.
				</Dialog.Description>
				<div class="flex justify-end">
					<Dialog.Close class={button}>Close</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
</div>
```

### Non-modal dialogs

Set `modal` to `false` to leave the rest of the page usable. A non-modal dialog does not trap focus, lock scroll, or block outside pointer events. Set `modal="trap-focus"` to trap focus without locking scroll or blocking outside pointers. Set `disablePointerDismissal` to stop outside presses from closing the dialog.

```svelte
<Dialog.Root modal={false}>…</Dialog.Root>
<Dialog.Root modal="trap-focus">…</Dialog.Root>
<Dialog.Root disablePointerDismissal>…</Dialog.Root>
```

## Differences from Base UI

- `open` and `triggerId` are bindable props. Use `bind:open` and `bind:triggerId` instead of `open`, `defaultOpen`, `triggerId`, and `defaultTriggerId` together. There are no `defaultOpen` or `defaultTriggerId` props: pass `open` or `triggerId` without `bind:` to set the initial state. Only form controls keep `defaultValue` and `defaultChecked`.
- `onOpenChange` runs before the state changes. Call `eventDetails.cancel()` to keep the dialog as it is. Setting `open` yourself does not call it.
- `eventDetails.preventUnmountOnClose()` keeps the popup mounted after a close, as in Base UI.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes below.
- `render` is a snippet that receives `(props, state, children)`. Spread `props` onto your element and render `children`. `Dialog.Root` renders no element, so it has no `render`.
- The `Dialog.Root` children snippet receives `{ payload }`, where React passes a render function.
- `actionsRef` is replaced by `bind:this` on `Dialog.Root`, which exposes `close()` and `unmount()`.
- `initialFocus` and `finalFocus` take an element, a boolean, or a function. They do not take ref objects. A function returns an element, `null`, or a boolean. For `finalFocus`, returning `null` focuses the trigger.
- Handlers use lowercase names, such as `onclick`. Call `event.preventDefault()` in a handler on `Dialog.Trigger` or `Dialog.Close` to skip its own handling.
- `Dialog.Portal` renders a `div` that keeps `data-base-ui-portal` even if you pass your own value. The attribute lets the dialog tell the portal host from its content. A `container` of `null` does not mount the dialog until you set an element or shadow root.
- A payload is stored only for a trigger that is mounted with the handle. `handle.open(id)` with an unknown id warns and still opens the dialog, and it keeps the current payload.
- Drawer is not available yet; see [Alert Dialog](/components/alert-dialog) for confirmations. Refs are not supported.

## API reference

### Root

<ApiPart name="dialog" part="Root" />

`Dialog.Root` renders no element, so it has no data attributes.

### Trigger

<ApiPart name="dialog" part="Trigger" />

| Attribute         | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `data-popup-open` | Present when the dialog is open and this trigger opened it. |
| `data-disabled`   | Present when the trigger is disabled.                       |

### Portal

<ApiPart name="dialog" part="Portal" />

### Backdrop

<ApiPart name="dialog" part="Backdrop" />

| Attribute             | Description                               |
| --------------------- | ----------------------------------------- |
| `data-open`           | Present when the dialog is open.          |
| `data-closed`         | Present when the dialog is closed.        |
| `data-starting-style` | Present when the dialog is animating in.  |
| `data-ending-style`   | Present when the dialog is animating out. |

### Viewport

<ApiPart name="dialog" part="Viewport" />

| Attribute                 | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                     |
| `data-closed`             | Present when the dialog is closed.                   |
| `data-nested`             | Present when the dialog is nested in another dialog. |
| `data-nested-dialog-open` | Present when a dialog nested in this one is open.    |
| `data-starting-style`     | Present when the dialog is animating in.             |
| `data-ending-style`       | Present when the dialog is animating out.            |

### Popup

<ApiPart name="dialog" part="Popup" />

| Attribute                 | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                     |
| `data-closed`             | Present when the dialog is closed.                   |
| `data-nested`             | Present when the dialog is nested in another dialog. |
| `data-nested-dialog-open` | Present when a dialog nested in this one is open.    |
| `data-starting-style`     | Present when the dialog is animating in.             |
| `data-ending-style`       | Present when the dialog is animating out.            |

| CSS variable       | Description                                    |
| ------------------ | ---------------------------------------------- |
| `--nested-dialogs` | The number of open dialogs nested in this one. |

### Title

<ApiPart name="dialog" part="Title" />

### Description

<ApiPart name="dialog" part="Description" />

### Close

<ApiPart name="dialog" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |
