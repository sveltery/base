import type { Component } from 'svelte';
import DialogBackdrop from '../dialog/DialogBackdrop.svelte';
import DialogClose from '../dialog/DialogClose.svelte';
import DialogDescription from '../dialog/DialogDescription.svelte';
import DialogPopup from '../dialog/DialogPopup.svelte';
import DialogPortal from '../dialog/DialogPortal.svelte';
import DialogTitle from '../dialog/DialogTitle.svelte';
import DialogTrigger from '../dialog/DialogTrigger.svelte';
import DialogViewport from '../dialog/DialogViewport.svelte';
import AlertDialogRoot from './AlertDialogRoot.svelte';
import { AlertDialogHandle, createAlertDialogHandle } from './handle.svelte.js';
import type { AlertDialogTriggerProps } from './types.js';

/** A button that opens the alert dialog. Renders a `<button>` element. */
const AlertDialogTrigger: Component<
	AlertDialogTriggerProps,
	Record<string, never>,
	''
> = DialogTrigger;

export const AlertDialog = {
	Root: AlertDialogRoot,
	Trigger: AlertDialogTrigger,
	Portal: DialogPortal,
	Popup: DialogPopup,
	Backdrop: DialogBackdrop,
	Title: DialogTitle,
	Description: DialogDescription,
	Close: DialogClose,
	Viewport: DialogViewport,
	Handle: AlertDialogHandle,
	createHandle: createAlertDialogHandle
};

export { AlertDialogHandle, createAlertDialogHandle };
export type * from './types.js';
