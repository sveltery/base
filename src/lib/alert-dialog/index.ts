import DialogBackdrop from '../dialog/DialogBackdrop.svelte';
import DialogClose from '../dialog/DialogClose.svelte';
import DialogDescription from '../dialog/DialogDescription.svelte';
import DialogPopup from '../dialog/DialogPopup.svelte';
import DialogPortal from '../dialog/DialogPortal.svelte';
import DialogTitle from '../dialog/DialogTitle.svelte';
import DialogViewport from '../dialog/DialogViewport.svelte';
import AlertDialogRoot from './AlertDialogRoot.svelte';
import AlertDialogTrigger from './AlertDialogTrigger.svelte';
import { AlertDialogHandle, createAlertDialogHandle } from './handle.svelte.js';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const AlertDialog = {
	Root: AlertDialogRoot as typeof AlertDialogRoot,
	Trigger: AlertDialogTrigger as typeof AlertDialogTrigger,
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
