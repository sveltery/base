import DialogBackdrop from './DialogBackdrop.svelte';
import DialogClose from './DialogClose.svelte';
import DialogDescription from './DialogDescription.svelte';
import DialogPopup from './DialogPopup.svelte';
import DialogPortal from './DialogPortal.svelte';
import DialogRoot from './DialogRoot.svelte';
import DialogTitle from './DialogTitle.svelte';
import DialogTrigger from './DialogTrigger.svelte';
import DialogViewport from './DialogViewport.svelte';
import { createDialogHandle, DialogHandle } from './handle.svelte.js';

export const Dialog = {
	Root: DialogRoot,
	Trigger: DialogTrigger,
	Portal: DialogPortal,
	Popup: DialogPopup,
	Backdrop: DialogBackdrop,
	Title: DialogTitle,
	Description: DialogDescription,
	Close: DialogClose,
	Viewport: DialogViewport,
	Handle: DialogHandle,
	createHandle: createDialogHandle
};

export { createDialogHandle, DialogHandle };
export type * from './types.js';
