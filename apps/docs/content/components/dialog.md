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
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		View notifications
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
		>
			<div class="flex flex-col gap-1">
				<Dialog.Title class="text-base font-bold">Notifications</Dialog.Title>
				<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Dialog.Description>
			</div>
			<div class="flex justify-end gap-3">
				<Dialog.Close
					class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
				>
					Close
				</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

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

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { Menu } from '@sveltery/base/menu';

	let dialogOpen = $state(false);

	const buttonClass =
		'flex h-8 items-center justify-center gap-1.5 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';

	const itemClass =
		"flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";
</script>

<Menu.Root>
	<Menu.Trigger class={buttonClass}>
		Playlist
		<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
			<path d="M12 6H4l4 4.5z" />
		</svg>
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class="outline-hidden" sideOffset={8} align="start">
			<Menu.Popup
				class="relative origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Menu.Item class={itemClass}>Play</Menu.Item>
				<Menu.Item class={itemClass}>Share</Menu.Item>
				<Menu.Separator class="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
				<!-- Open the dialog when the menu item is clicked -->
				<Menu.Item class={itemClass} onclick={() => (dialogOpen = true)}>Details…</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<!-- Control the dialog state -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
		>
			<div class="flex flex-col gap-1">
				<Dialog.Title class="text-base font-bold">Playlist details</Dialog.Title>
				<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					This playlist contains 24 songs and was last updated today.
				</Dialog.Description>
			</div>
			<div class="flex justify-end gap-3">
				<Dialog.Close class={buttonClass}>Close</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Nested dialogs

You can nest dialogs within one another normally.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	const buttonClasses =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400';

	const popupClasses =
		'fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 scale-[calc(1-0.1*var(--nested-dialogs))] bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[top,scale,opacity] duration-100 ease-out after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out after:pointer-events-none data-ending-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonClasses}>View notifications</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Popup class={popupClasses}>
			<div class="flex flex-col gap-1">
				<Dialog.Title class="text-base font-bold">Notifications</Dialog.Title>
				<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Dialog.Description>
			</div>
			<div class="flex items-center gap-3">
				<Dialog.Root>
					<Dialog.Trigger class={buttonClasses}>Customize</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Popup class={popupClasses}>
							<div class="flex flex-col gap-1">
								<Dialog.Title class="text-base font-bold">Customize notifications</Dialog.Title>
								<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
									Review your settings here.
								</Dialog.Description>
							</div>
							<div class="flex items-center justify-end gap-3">
								<Dialog.Close class={buttonClasses}>Close</Dialog.Close>
							</div>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button. Call `eventDetails.cancel()` in that callback to keep the parent dialog open while the confirmation shows.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Dialog } from '@sveltery/base/dialog';

	let dialogOpen = $state(false);
	let confirmationOpen = $state(false);
	let textareaValue = $state('');
	const titleId = $props.id();
</script>

<Dialog.Root
	bind:open={dialogOpen}
	onOpenChange={(open, eventDetails) => {
		if (!open && textareaValue) {
			eventDetails.cancel();
			confirmationOpen = true;
		} else {
			textareaValue = '';
		}
	}}
>
	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Tweet
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Popup
			class="fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-1 scale-[calc(1-0.1*var(--nested-dialogs))] bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[top,scale,opacity] duration-100 ease-out after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out after:pointer-events-none data-ending-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
		>
			<Dialog.Title id={titleId} class="text-base font-bold">New tweet</Dialog.Title>
			<form
				class="flex flex-col gap-4"
				onsubmit={(event) => {
					event.preventDefault();
					dialogOpen = false;
				}}
			>
				<textarea
					aria-labelledby={titleId}
					required
					class="min-h-32 w-full border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 p-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white"
					placeholder="What’s on your mind?"
					bind:value={textareaValue}></textarea>
				<div class="flex justify-end gap-3">
					<Dialog.Close
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
					>
						Cancel
					</Dialog.Close>
					<button
						type="submit"
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
					>
						Tweet
					</button>
				</div>
			</form>
		</Dialog.Popup>
	</Dialog.Portal>

	<!-- Confirmation dialog -->
	<AlertDialog.Root bind:open={confirmationOpen}>
		<AlertDialog.Portal>
			<AlertDialog.Popup
				class="fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 scale-[calc(1-0.1*var(--nested-dialogs))] bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[top,scale,opacity] duration-100 ease-out after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity after:duration-100 after:ease-out after:pointer-events-none data-ending-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-nested-dialog-open:after:opacity-100 data-starting-style:top-[calc(50%+0.25rem+1.25rem*var(--nested-dialogs))] data-starting-style:scale-[0.96] data-starting-style:opacity-0"
			>
				<div class="flex flex-col gap-1">
					<AlertDialog.Title class="text-base font-bold">Discard tweet?</AlertDialog.Title>
					<AlertDialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
						Your tweet will be lost.
					</AlertDialog.Description>
				</div>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
					>
						Go back
					</AlertDialog.Close>
					<button
						type="button"
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
						onclick={() => {
							confirmationOpen = false;
							dialogOpen = false;
						}}
					>
						Discard
					</button>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
</Dialog.Root>
```

### Custom focus management

You can control where the focus goes when the dialog opens and closes using the `initialFocus` and `finalFocus` props on the `<Dialog.Popup>` component.

You can also set these props to `false` to prevent focus from moving when the dialog opens or closes, or to a function that returns the element to focus based on the interaction type. There is no ref object: pass an element, or a function that returns the element.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { Field } from '@sveltery/base/field';
	import { Fieldset } from '@sveltery/base/fieldset';

	let initialFocusEl = $state<HTMLInputElement | null>(null);
	let finalFocusEl = $state<HTMLButtonElement | null>(null);
</script>

<div class="flex flex-wrap justify-center gap-3">
	<Dialog.Root>
		<Dialog.Trigger
			class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
		>
			Open feedback
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
			/>
			<Dialog.Popup
				initialFocus={() => initialFocusEl}
				finalFocus={() => finalFocusEl}
				class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<div class="flex flex-col gap-1">
					<Dialog.Title class="text-base font-bold">Feedback form</Dialog.Title>
					<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
						Your feedback means a lot to us.
					</Dialog.Description>
				</div>
				<Fieldset.Root class="flex flex-col gap-3 border-0 p-0 m-0">
					<Field.Root class="flex flex-col items-start gap-1">
						<Field.Label class="text-sm font-normal">Full name</Field.Label>
						<Field.Control
							placeholder="Enter your name"
							class="h-8 w-full border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white"
						/>
					</Field.Root>
					<Field.Root class="flex flex-col items-start gap-1">
						<Field.Label class="text-sm font-normal">Feedback</Field.Label>
						<Field.Control
							{@attach (node) => {
								initialFocusEl = node as HTMLInputElement;
							}}
							required
							placeholder="Enter your feedback"
							class="h-8 w-full border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white"
						/>
					</Field.Root>
				</Fieldset.Root>
				<div class="flex justify-end gap-3">
					<Dialog.Close
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
					>
						Close
					</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
	<button
		bind:this={finalFocusEl}
		type="button"
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
	>
		Final focus
	</button>
</div>
```

### Outside scroll dialog

The dialog can be made scrollable by using `<Dialog.Viewport>` as an outer scrollable container for `<Dialog.Popup>` while the popup can extend past the bottom edge. The scrollable area uses the [Scroll Area component](/components/scroll-area) to provide custom scrollbars.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { ScrollArea } from '@sveltery/base/scroll-area';

	let popupEl = $state<HTMLElement | null>(null);

	const CONTENT_SECTIONS = [
		{
			title: 'What a dialog is for',
			body: 'Use a dialog when you need the user to complete a focused task or read something important without navigating away. It opens on top of the page and returns focus back where it started when closed.'
		},
		{
			title: 'Anatomy at a glance',
			body: 'Root, Trigger, Portal, Backdrop, Viewport, Popup, Title, Description, Close. Keep the title short and the first paragraph specific so screen readers announce something meaningful.'
		},
		{
			title: 'Opening and closing',
			body: 'Control it using external state via the `open` and `onOpenChange` props, or let it manage state for you internally.'
		},
		{
			title: 'Keyboard and focus behavior',
			body: 'Focus moves inside the dialog when it opens. Tab and Shift+Tab loop within, and Esc requests close.'
		},
		{
			title: 'Accessible labeling',
			body: 'Set an explicit title and description using the `Dialog.Title` and `Dialog.Description` components.'
		},
		{
			title: 'Backdrop and page scrolling',
			body: 'The backdrop visually separates layers while background content is inert. Don’t rely on dimness alone—keep copy clear and buttons obvious so actions are easy to choose.'
		},
		{
			title: 'Portals and stacking',
			body: 'Dialogs render in a portal so they sit above the `isolation: isolate` app content and avoid local z-index wars.'
		},
		{
			title: 'Viewport overflow',
			body: 'Let long content overflow the bottom edge and reveal as you scroll the page container. Keep generous padding at the top and bottom so the dialog doesn’t feel jammed against the edges.'
		},
		{
			title: 'Nested dialogs and confirmations',
			body: 'If closing a dialog needs confirmation, open a child alert dialog rather than mutating the current one. The parent stays visible behind it; only the topmost layer should feel interactive.'
		},
		{
			title: 'Transitions that respect motion settings',
			body: 'Use small, fast transitions (opacity plus a few pixels of Y translation or scale). Subtle motion helps people notice what changed without slowing them down.'
		},
		{
			title: 'Controlled vs. uncontrolled',
			body: 'Controlled state is best when other parts of the page need to react to open/close. Uncontrolled is fine for local cases where only the dialog matters.'
		},
		{
			title: 'Close affordances',
			body: 'Always offer a visible close button in the corner. Don’t rely only on Esc or the backdrop for pointer outside presses. Touch screen readers and accessibility users benefit from a clear, targetable control to click to close the dialog.'
		},
		{
			title: 'Forms inside dialogs',
			body: 'Keep forms short; longer flows usually deserve a full page. Validate inline, keep button text specific (“Create project”), and disable destructive actions until the input is valid.'
		},
		{
			title: 'Content guidelines',
			body: 'Lead with the outcome (“Rename project?”) and follow with one or two short, concrete sentences. Avoid long prose; link out for details instead.'
		},
		{
			title: 'SSR and hydration notes',
			body: 'Because dialogs render in a portal, make sure your portal container exists on the client.'
		},
		{
			title: 'Mobile ergonomics',
			body: 'Use larger touch targets and keep the close button reachable with the thumb. Avoid full-screen modals unless the task truly needs a whole screen.'
		},
		{
			title: 'Theming and density',
			body: 'Match spacing and corner radius to your system. Use a slightly denser layout than pages so the dialog feels purpose-built, not like a mini web page.'
		},
		{
			title: 'Internationalization',
			body: 'Plan for longer text. Buttons can grow to two lines; titles should wrap gracefully. Keep destructive terms consistent across locales.'
		},
		{
			title: 'Performance',
			body: 'Children are mounted lazily when the dialog opens. If the dialog can reopen often, consider the `keepMounted` prop sparingly to perform the work only once on mount to avoid re-initializing complex component trees on each open.'
		},
		{
			title: 'When a popover is better',
			body: 'If the content is a small hint or a few quick actions anchored to a control, use a popover or menu instead of a dialog. Dialogs interrupt on purpose—use that sparingly.'
		},
		{
			title: 'Follow-up and cleanup',
			body: 'After a successful action, close the dialog and show confirmation in context (toast, inline message, or updated UI) so people can see the result of what they just did.'
		}
	];

	const RELATED_LINKS = [
		{ href: '/components/scroll-area', label: 'Scroll Area' },
		{ href: '/components/drawer', label: 'Drawer' },
		{ href: '/components/popover', label: 'Popover' }
	];
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Open dialog
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 bg-black/20 dark:bg-black/50 transition-opacity duration-[600ms] ease-[var(--ease-out-fast)] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[350ms] data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Viewport class="group/dialog fixed inset-0">
			<ScrollArea.Root
				style="position: static"
				class="h-full overscroll-contain group-data-ending-style/dialog:pointer-events-none"
			>
				<ScrollArea.Viewport
					class="h-full overscroll-contain group-data-ending-style/dialog:pointer-events-none"
				>
					<ScrollArea.Content class="flex min-h-full items-center justify-center">
						<Dialog.Popup
							{@attach (node) => {
								popupEl = node;
							}}
							initialFocus={() => popupEl}
							class="outline-0 relative mx-auto my-16 flex w-[min(40rem,calc(100vw-2rem))] flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[translate] duration-[700ms] ease-[cubic-bezier(0.45,1.005,0,1.005)] data-starting-style:translate-y-[100dvh] data-ending-style:translate-y-[max(100dvh,100%)] data-ending-style:duration-[350ms] data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] motion-reduce:transition-none"
						>
							<div class="relative flex flex-col gap-1 pr-8">
								<Dialog.Title class="text-base font-bold">Dialog</Dialog.Title>
								<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
									This layout keeps an outer container scrollable while the dialog can extend past
									the bottom edge.
								</Dialog.Description>
								<Dialog.Close
									aria-label="Close"
									class="absolute -top-1 -right-1 inline-flex items-center justify-center w-8 h-8 border-none bg-transparent p-0 text-neutral-950 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										stroke-linecap="square"
										stroke-linejoin="round"
										style="display: block"
									>
										<path d="m2.5 2.5 11 11m-11 0 11-11" />
									</svg>
								</Dialog.Close>
							</div>

							<div class="flex flex-col gap-4">
								{#each CONTENT_SECTIONS as item (item.title)}
									<section class="flex flex-col gap-1">
										<h3 class="text-sm font-bold">{item.title}</h3>
										<p class="text-sm text-neutral-700 dark:text-neutral-300">{item.body}</p>
									</section>
								{/each}
							</div>

							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Related docs:{' '}{#each RELATED_LINKS as item, index (item.href)}{#if index > 0},
									{/if}<a
										class="text-neutral-950 dark:text-white underline underline-offset-[0.16em] decoration-[1px] hover:no-underline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white focus-visible:outline-offset-2"
										href={item.href}>{item.label}</a
									>{/each}.
							</p>
						</Dialog.Popup>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar
					class="pointer-events-none flex w-4 justify-center bg-black/12 dark:bg-white/12 opacity-0 transition-opacity duration-[250ms] data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-[75ms] data-scrolling:delay-[0ms] hover:pointer-events-auto hover:opacity-100 hover:duration-[75ms] hover:delay-[0ms] group-data-ending-style/dialog:opacity-0 group-data-ending-style/dialog:duration-[250ms]"
				>
					<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>
```

### Inside scroll dialog

The dialog can be made scrollable by making an inner container scrollable while the popup stays fully on screen. `<Dialog.Viewport>` is used as a positioning container for `<Dialog.Popup>`, while an inner scrollable area is created using the [Scroll Area component](/components/scroll-area).

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import { ScrollArea } from '@sveltery/base/scroll-area';

	const CONTENT_SECTIONS = [
		{
			title: 'What a dialog is for',
			body: 'Use a dialog when you need the user to complete a focused task or read something important without navigating away. It opens on top of the page and returns focus back where it started when closed.'
		},
		{
			title: 'Anatomy at a glance',
			body: 'Root, Trigger, Portal, Backdrop, Popup, Title/Description, Close. Keep the title short and the first paragraph specific so screen readers announce something meaningful.'
		},
		{
			title: 'Opening and closing',
			body: 'Control it using external state via the `open` and `onOpenChange` props, or let it manage state for you internally.'
		},
		{
			title: 'Keyboard and focus behavior',
			body: 'Focus moves inside the dialog when it opens. Tab and Shift+Tab loop within, and Esc requests close.'
		},
		{
			title: 'Accessible labeling',
			body: 'Set an explicit title and description using the `Dialog.Title` and `Dialog.Description` components.'
		},
		{
			title: 'Backdrop and page scrolling',
			body: 'The backdrop visually separates layers while background content is inert. Don’t rely on dimness alone—keep copy clear and buttons obvious so actions are easy to choose.'
		},
		{
			title: 'Portals and stacking',
			body: 'Dialogs render in a portal so they sit above the `isolation: isolate` app content and avoid local z-index wars.'
		},
		{
			title: 'Viewport overflow',
			body: 'Let long content overflow the bottom edge and reveal as you scroll the page container. Keep generous padding at the top and bottom so the dialog doesn’t feel jammed against the edges.'
		},
		{
			title: 'Nested dialogs and confirmations',
			body: 'If closing a dialog needs confirmation, open a child alert dialog rather than mutating the current one. The parent stays visible behind it; only the topmost layer should feel interactive.'
		},
		{
			title: 'Transitions that respect motion settings',
			body: 'Use small, fast transitions (opacity plus a few pixels of Y translation or scale). Subtle motion helps people notice what changed without slowing them down.'
		},
		{
			title: 'Controlled vs. uncontrolled',
			body: 'Controlled state is best when other parts of the page need to react to open/close. Uncontrolled is fine for local cases where only the dialog matters.'
		},
		{
			title: 'Close affordances',
			body: 'Always offer a visible close button in the corner. Don’t rely only on Esc or the backdrop for pointer outside presses. Touch screen readers and accessibility users benefit from a clear, targetable control to click to close the dialog.'
		},
		{
			title: 'Forms inside dialogs',
			body: 'Keep forms short; longer flows usually deserve a full page. Validate inline, keep button text specific (“Create project”), and disable destructive actions until the input is valid.'
		},
		{
			title: 'Content guidelines',
			body: 'Lead with the outcome (“Rename project?”) and follow with one or two short, concrete sentences. Avoid long prose; link out for details instead.'
		},
		{
			title: 'SSR and hydration notes',
			body: 'Because dialogs render in a portal, make sure your portal container exists on the client.'
		},
		{
			title: 'Mobile ergonomics',
			body: 'Use larger touch targets and keep the close button reachable with the thumb. Avoid full-screen modals unless the task truly needs a whole screen.'
		},
		{
			title: 'Theming and density',
			body: 'Match spacing and corner radius to your system. Use a slightly denser layout than pages so the dialog feels purpose-built, not like a mini web page.'
		},
		{
			title: 'Internationalization',
			body: 'Plan for longer text. Buttons can grow to two lines; titles should wrap gracefully. Keep destructive terms consistent across locales.'
		},
		{
			title: 'Performance',
			body: 'Children are mounted lazily when the dialog opens. If the dialog can reopen often, consider the `keepMounted` prop sparingly to perform the work only once on mount to avoid re-initializing complex component trees on each open.'
		},
		{
			title: 'When a popover is better',
			body: 'If the content is a small hint or a few quick actions anchored to a control, use a popover or menu instead of a dialog. Dialogs interrupt on purpose—use that sparingly.'
		},
		{
			title: 'Follow-up and cleanup',
			body: 'After a successful action, close the dialog and show confirmation in context (toast, inline message, or updated UI) so people can see the result of what they just did.'
		}
	];
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Open dialog
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 bg-black opacity-20 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Viewport
			class="fixed inset-0 flex items-center justify-center overflow-hidden py-6 [@media(min-height:600px)]:pb-12 [@media(min-height:600px)]:pt-8"
		>
			<Dialog.Popup
				class="relative flex w-[min(40rem,calc(100vw-2rem))] max-h-full max-w-full min-h-0 flex-col bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0"
			>
				<div class="flex flex-col gap-1 p-4 border-b border-neutral-950 dark:border-white">
					<Dialog.Title class="text-base font-bold">Dialog</Dialog.Title>
					<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
						This layout keeps the popup fully on screen while allowing its content to scroll.
					</Dialog.Description>
				</div>
				<ScrollArea.Root
					class="relative flex min-h-0 flex-auto overflow-hidden has-[>_:first-child:focus-visible]:outline-2 has-[>_:first-child:focus-visible]:outline-offset-0 has-[>_:first-child:focus-visible]:outline-neutral-950 dark:has-[>_:first-child:focus-visible]:outline-white"
				>
					<ScrollArea.Viewport
						class="flex-auto min-h-0 overflow-y-auto overscroll-contain outline-none"
					>
						<ScrollArea.Content class="flex flex-col">
							{#each CONTENT_SECTIONS as item (item.title)}
								<section class="flex flex-col gap-1 p-4">
									<h3 class="text-sm font-bold">{item.title}</h3>
									<p class="text-sm text-neutral-700 dark:text-neutral-300">{item.body}</p>
								</section>
							{/each}
						</ScrollArea.Content>
					</ScrollArea.Viewport>
					<ScrollArea.Scrollbar
						class="pointer-events-none flex w-4 justify-center bg-black/12 dark:bg-white/12 opacity-0 transition-opacity duration-150 data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
					>
						<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
					</ScrollArea.Scrollbar>
				</ScrollArea.Root>
				<div class="flex justify-end gap-3 p-4 border-t border-neutral-950 dark:border-white">
					<Dialog.Close
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
					>
						Close
					</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>
```

### Placing elements outside the popup

When adding elements that should appear "outside" the colored popup area, continue to place them inside `<Dialog.Popup>`, but create a child element that has the popup styles. This ensures they are kept in the tab order and announced correctly by screen readers.

`<Dialog.Popup>` has `pointer-events: none`, while inner content (the colored popup and close button) has `pointer-events: auto` so clicks on the backdrop continue to be registered.

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	>
		Open dialog
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black/20 dark:bg-black/50 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Viewport class="fixed inset-0 grid place-items-center px-4 py-12 xl:py-6">
			<Dialog.Popup
				class="group/popup relative flex h-full w-full max-w-[70rem] xl:max-w-none justify-center pointer-events-none transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0"
			>
				<Dialog.Close
					class="absolute right-0 -top-10 flex h-8 w-8 items-center justify-center border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 xl:top-0 pointer-events-auto focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
					aria-label="Close"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						stroke-linecap="square"
						stroke-linejoin="round"
						style="display: block"
					>
						<path d="m2.5 2.5 11 11m-11 0 11-11" />
					</svg>
				</Dialog.Close>
				<div
					class="pointer-events-auto h-full w-full max-w-[70rem] bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-starting-style/popup:scale-105"
				></div>
			</Dialog.Popup>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>
```

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

```svelte demo
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	const demoDialog = Dialog.createHandle();
</script>

<Dialog.Trigger
	class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
	handle={demoDialog}
>
	View notifications
</Dialog.Trigger>

<Dialog.Root handle={demoDialog}>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<Dialog.Popup
			class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
		>
			<div class="flex flex-col gap-1">
				<Dialog.Title class="text-base font-bold">Notifications</Dialog.Title>
				<Dialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You are all caught up. Good job!
				</Dialog.Description>
			</div>
			<div class="flex justify-end gap-3">
				<Dialog.Close
					class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
				>
					Close
				</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

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

```svelte demo
<script lang="ts">
	import { Dialog, type DialogChangeEventDetails } from '@sveltery/base/dialog';

	const demoDialog = Dialog.createHandle<number>();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	function handleOpenChange(isOpen: boolean, eventDetails: DialogChangeEventDetails) {
		open = isOpen;
		triggerId = eventDetails.trigger?.id ?? null;
	}
</script>

<div class="flex flex-wrap gap-2 justify-center">
	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
		handle={demoDialog}
		id="trigger-1"
		payload={1}
	>
		Open 1
	</Dialog.Trigger>

	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
		handle={demoDialog}
		id="trigger-2"
		payload={2}
	>
		Open 2
	</Dialog.Trigger>

	<Dialog.Trigger
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
		handle={demoDialog}
		id="trigger-3"
		payload={3}
	>
		Open 3
	</Dialog.Trigger>

	<button
		type="button"
		class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		onclick={() => {
			triggerId = 'trigger-2';
			open = true;
		}}
	>
		Open programmatically
	</button>
</div>

<Dialog.Root handle={demoDialog} {open} onOpenChange={handleOpenChange} {triggerId}>
	{#snippet children({ payload })}
		<Dialog.Portal>
			<Dialog.Backdrop
				class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
			/>
			<Dialog.Popup
				class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				{#if payload !== undefined}
					<Dialog.Title class="text-base font-bold">Dialog {payload}</Dialog.Title>
				{/if}

				<div class="flex justify-end gap-3">
					<Dialog.Close
						class="flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 dark:text-white select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
					>
						Close
					</Dialog.Close>
				</div>
			</Dialog.Popup>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
```

## API reference

### Root

<ApiPart name="dialog" part="Root" />

### Trigger

<ApiPart name="dialog" part="Trigger" />

| Attribute         | Description                                    |
| ----------------- | ---------------------------------------------- |
| `data-popup-open` | Present when the corresponding dialog is open. |
| `data-disabled`   | Present when the trigger is disabled.          |

### Portal

<ApiPart name="dialog" part="Portal" />

### Backdrop

<ApiPart name="dialog" part="Backdrop" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-open`           | Present when the dialog is open.             |
| `data-closed`         | Present when the dialog is closed.           |
| `data-starting-style` | Present when the dialog begins animating in. |
| `data-ending-style`   | Present when the dialog is animating out.    |

### Viewport

<ApiPart name="dialog" part="Viewport" />

| Attribute                 | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                                 |
| `data-closed`             | Present when the dialog is closed.                               |
| `data-nested`             | Present when the dialog is nested within another dialog.         |
| `data-nested-dialog-open` | Present when the dialog has other open dialogs nested within it. |
| `data-starting-style`     | Present when the dialog begins animating in.                     |
| `data-ending-style`       | Present when the dialog is animating out.                        |

### Popup

<ApiPart name="dialog" part="Popup" />

| Attribute                 | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                                 |
| `data-closed`             | Present when the dialog is closed.                               |
| `data-nested`             | Present when the dialog is nested within another dialog.         |
| `data-nested-dialog-open` | Present when the dialog has other open dialogs nested within it. |
| `data-starting-style`     | Present when the dialog begins animating in.                     |
| `data-ending-style`       | Present when the dialog is animating out.                        |

| CSS variable       | Description                                   |
| ------------------ | --------------------------------------------- |
| `--nested-dialogs` | Indicates how many dialogs are nested within. |

### Title

<ApiPart name="dialog" part="Title" />

### Description

<ApiPart name="dialog" part="Description" />

### Close

<ApiPart name="dialog" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

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
