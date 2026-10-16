# Alert Dialog

<Subtitle>
  A dialog that requires a user response to proceed.
</Subtitle>

<Meta name="description" content="A dialog that requires a user response to proceed." />

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	const baseButtonClasses =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400';

	const buttonClasses = `${baseButtonClasses} text-neutral-950 dark:text-white`;

	const dangerButtonClasses = `${baseButtonClasses} text-red-700 dark:text-red-400`;
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class={dangerButtonClasses}>Discard draft</AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<AlertDialog.Popup
			class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
		>
			<div class="flex flex-col gap-1">
				<AlertDialog.Title class="text-base font-bold">Discard draft?</AlertDialog.Title>
				<AlertDialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You can’t undo this action.
				</AlertDialog.Description>
			</div>
			<div class="flex justify-end gap-3">
				<AlertDialog.Close class={buttonClasses}>Cancel</AlertDialog.Close>
				<AlertDialog.Close class={dangerButtonClasses}>Discard</AlertDialog.Close>
			</div>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
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

## Examples

### Open from a menu

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onclick` handler on the menu item. Bind `open` on `<AlertDialog.Root>` and set it from that handler.

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';
	import { Menu } from '@sveltery/base/menu';

	let dialogOpen = $state(false);

	const baseButtonClass =
		'flex h-8 items-center justify-center gap-1.5 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-pressed:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';

	const buttonClass = `${baseButtonClass} text-neutral-950 dark:text-white`;

	const dangerButtonClass = `${baseButtonClass} text-red-700 dark:text-red-400`;

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
				<!-- Open the alert dialog when the menu item is clicked -->
				<Menu.Item class={itemClass} onclick={() => (dialogOpen = true)}>Delete…</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

<!-- Control the alert dialog state -->
<AlertDialog.Root bind:open={dialogOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<AlertDialog.Popup
			class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
		>
			<div class="flex flex-col gap-1">
				<AlertDialog.Title class="text-base font-bold">Delete playlist?</AlertDialog.Title>
				<AlertDialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					You can't undo this action.
				</AlertDialog.Description>
			</div>
			<div class="flex justify-end gap-3">
				<AlertDialog.Close class={buttonClass}>Cancel</AlertDialog.Close>
				<AlertDialog.Close class={dangerButtonClass}>Delete</AlertDialog.Close>
			</div>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
```

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button. Call `eventDetails.cancel()` in that callback to keep the parent dialog open while the confirmation shows.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

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

### Detached triggers

An alert dialog can be controlled by a trigger located either inside or outside the `<AlertDialog.Root>` component.
For simple, one-off interactions, place the `<AlertDialog.Trigger>` inside `<AlertDialog.Root>`, as shown in the example at the top of this page.

However, if defining the alert dialog's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<AlertDialog.Trigger>` outside of `<AlertDialog.Root>` and linking them with a `handle` created by the `AlertDialog.createHandle()` function.

The imperative methods on the handle, such as `open()` and `openWithPayload()`, require an `<AlertDialog.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	const demoAlertDialog = AlertDialog.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoAlertDialog}" -->
<AlertDialog.Trigger handle={demoAlertDialog}>Open</AlertDialog.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoAlertDialog}" -->
<AlertDialog.Root handle={demoAlertDialog}>...</AlertDialog.Root>
```

```svelte demo
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	const demoAlertDialog = AlertDialog.createHandle();

	const baseButtonClasses =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400';

	const buttonClasses = `${baseButtonClasses} text-neutral-950 dark:text-white`;

	const dangerButtonClasses = `${baseButtonClasses} text-red-700 dark:text-red-400`;
</script>

<AlertDialog.Trigger class={dangerButtonClasses} handle={demoAlertDialog}>
	Discard draft
</AlertDialog.Trigger>

<AlertDialog.Root handle={demoAlertDialog}>
	<AlertDialog.Portal>
		<AlertDialog.Backdrop
			class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
		/>
		<AlertDialog.Popup
			class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
		>
			<div class="flex flex-col gap-1">
				<AlertDialog.Title class="text-base font-bold">Discard draft?</AlertDialog.Title>
				<AlertDialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
					This action cannot be undone.
				</AlertDialog.Description>
			</div>
			<div class="flex justify-end gap-3">
				<AlertDialog.Close class={buttonClasses}>Cancel</AlertDialog.Close>
				<AlertDialog.Close class={dangerButtonClasses}>Discard</AlertDialog.Close>
			</div>
		</AlertDialog.Popup>
	</AlertDialog.Portal>
</AlertDialog.Root>
```

### Multiple triggers

A single alert dialog can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<AlertDialog.Trigger>` components inside a single `<AlertDialog.Root>`.

```svelte title="Multiple triggers within the Root part"
<AlertDialog.Root>
	<AlertDialog.Trigger>Trigger 1</AlertDialog.Trigger>
	<AlertDialog.Trigger>Trigger 2</AlertDialog.Trigger>
	...
</AlertDialog.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	const demoAlertDialog = AlertDialog.createHandle();
</script>

<AlertDialog.Trigger handle={demoAlertDialog}>Trigger 1</AlertDialog.Trigger>
<AlertDialog.Trigger handle={demoAlertDialog}>Trigger 2</AlertDialog.Trigger>
<AlertDialog.Root handle={demoAlertDialog}>...</AlertDialog.Root>
```

The alert dialog can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<AlertDialog.Trigger>` and reading it from the `children` snippet of `<AlertDialog.Root>`, which receives `{ payload }`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { AlertDialog } from '@sveltery/base/alert-dialog';

	// @highlight
	const demoAlertDialog = AlertDialog.createHandle<{ message: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<AlertDialog.Trigger handle={demoAlertDialog} payload={{ message: 'Trigger 1' }}>
	Trigger 1
</AlertDialog.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<AlertDialog.Trigger handle={demoAlertDialog} payload={{ message: 'Trigger 2' }}>
	Trigger 2
</AlertDialog.Trigger>

<AlertDialog.Root handle={demoAlertDialog}>
	<!-- @highlight-text "payload" -->
	{#snippet children({ payload })}
		<AlertDialog.Portal>
			<AlertDialog.Popup>
				<AlertDialog.Title>Alert dialog</AlertDialog.Title>
				<!-- @highlight-text "payload" -->
				{#if payload !== undefined}
					<AlertDialog.Description>
						<!-- @highlight-text "payload" -->
						Confirming {payload.message}
					</AlertDialog.Description>
				{/if}
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	{/snippet}
</AlertDialog.Root>
```

### Controlled mode with multiple triggers

You can control the alert dialog's open state externally using the `open` and `onOpenChange` props on `<AlertDialog.Root>`.
This allows you to manage the alert dialog's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<AlertDialog.Root>` and the `id` prop on each `<AlertDialog.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

```svelte demo
<script lang="ts">
	import { AlertDialog, type AlertDialogChangeEventDetails } from '@sveltery/base/alert-dialog';

	type AlertPayload = { message: string };

	const demoAlertDialog = AlertDialog.createHandle<AlertPayload>();

	const baseButtonClasses =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-3 text-sm leading-none whitespace-nowrap font-normal select-none hover:not-data-disabled:bg-neutral-100 dark:hover:not-data-disabled:bg-neutral-800 active:not-data-disabled:bg-neutral-200 dark:active:not-data-disabled:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400';

	const buttonClasses = `${baseButtonClasses} text-neutral-950 dark:text-white`;

	const dangerButtonClasses = `${baseButtonClasses} text-red-700 dark:text-red-400`;

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	function handleOpenChange(isOpen: boolean, eventDetails: AlertDialogChangeEventDetails) {
		open = isOpen;
		triggerId = eventDetails.trigger?.id ?? null;
	}
</script>

<div class="flex flex-wrap gap-2 justify-center">
	<AlertDialog.Trigger
		class={dangerButtonClasses}
		handle={demoAlertDialog}
		id="alert-trigger-1"
		payload={{ message: 'Discard draft?' }}
	>
		Discard
	</AlertDialog.Trigger>

	<AlertDialog.Trigger
		class={dangerButtonClasses}
		handle={demoAlertDialog}
		id="alert-trigger-2"
		payload={{ message: 'Delete project?' }}
	>
		Delete
	</AlertDialog.Trigger>

	<AlertDialog.Trigger
		class={buttonClasses}
		handle={demoAlertDialog}
		id="alert-trigger-3"
		payload={{ message: 'Sign out?' }}
	>
		Sign out
	</AlertDialog.Trigger>

	<button
		type="button"
		class={buttonClasses}
		onclick={() => {
			triggerId = 'alert-trigger-2';
			open = true;
		}}
	>
		Open programmatically
	</button>
</div>

<AlertDialog.Root handle={demoAlertDialog} {open} onOpenChange={handleOpenChange} {triggerId}>
	{#snippet children({ payload })}
		<AlertDialog.Portal>
			<AlertDialog.Backdrop
				class="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-50 supports-[-webkit-touch-callout:none]:absolute"
			/>
			<AlertDialog.Popup
				class="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
			>
				<div class="flex flex-col gap-1">
					<AlertDialog.Title class="text-base font-bold">
						{payload?.message ?? 'Are you sure?'}
					</AlertDialog.Title>
					<AlertDialog.Description class="text-sm text-neutral-600 dark:text-neutral-400">
						This action cannot be undone.
					</AlertDialog.Description>
				</div>
				<div class="flex justify-end gap-3">
					<AlertDialog.Close class={buttonClasses}>Cancel</AlertDialog.Close>
					<AlertDialog.Close class={dangerButtonClasses}>Confirm</AlertDialog.Close>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	{/snippet}
</AlertDialog.Root>
```

## API reference

### Root

<ApiPart name="alert-dialog" part="Root" />

### Trigger

<ApiPart name="alert-dialog" part="Trigger" />

| Attribute         | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `data-popup-open` | Present when the corresponding alert dialog is open. |
| `data-disabled`   | Present when the trigger is disabled.                |

### Portal

<ApiPart name="alert-dialog" part="Portal" />

### Backdrop

<ApiPart name="alert-dialog" part="Backdrop" />

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-open`           | Present when the dialog is open.             |
| `data-closed`         | Present when the dialog is closed.           |
| `data-starting-style` | Present when the dialog begins animating in. |
| `data-ending-style`   | Present when the dialog is animating out.    |

### Viewport

<ApiPart name="alert-dialog" part="Viewport" />

| Attribute                 | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                                 |
| `data-closed`             | Present when the dialog is closed.                               |
| `data-nested`             | Present when the dialog is nested within another dialog.         |
| `data-nested-dialog-open` | Present when the dialog has other open dialogs nested within it. |
| `data-starting-style`     | Present when the dialog begins animating in.                     |
| `data-ending-style`       | Present when the dialog is animating out.                        |

### Popup

<ApiPart name="alert-dialog" part="Popup" />

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

<ApiPart name="alert-dialog" part="Title" />

### Description

<ApiPart name="alert-dialog" part="Description" />

### Close

<ApiPart name="alert-dialog" part="Close" />

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |

## createHandle

Creates a new handle to connect an `AlertDialog.Root` with detached `AlertDialog.Trigger` components.

**Return value**

`AlertDialog.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls An Alert Dialog imperatively and associates detached `AlertDialog.Trigger` components with an `AlertDialog.Root`. Create one with `AlertDialog.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                          |
| --------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the alert dialog is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the alert dialog, or the one passed to `openWithPayload()`.   |

**Methods**

| Method            | Parameters                  | Returns | Description                                                                                                                                                                        |
| ----------------- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`            | `triggerId: string \| null` | `void`  | Opens the alert dialog, optionally associating it with a trigger. This method should only be called in an event handler or an effect (not during rendering).                       |
| `openWithPayload` | `payload: Payload`          | `void`  | Opens the alert dialog with the given payload, without associating it with any trigger. This method should only be called in an event handler or an effect (not during rendering). |
| `close`           |                             | `void`  | Closes the alert dialog. This method should only be called in an event handler or an effect (not during rendering).                                                                |
| `unmount`         |                             | `void`  | Removes the popup at once, without waiting for the exit animation.                                                                                                                 |
