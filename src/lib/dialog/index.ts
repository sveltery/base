import DialogBackdrop from './DialogBackdrop.svelte';
import DialogClose from './DialogClose.svelte';
import DialogDescription from './DialogDescription.svelte';
import DialogPopup from './DialogPopup.svelte';
import DialogPortal from './DialogPortal.svelte';
import DialogRoot from './DialogRoot.svelte';
import DialogTitle from './DialogTitle.svelte';
import DialogTrigger from './DialogTrigger.svelte';
import DialogViewport from './DialogViewport.svelte';
import { PopupHandle } from '../internal/popups/index.js';
import { createDialogHandle } from './handle.svelte.js';

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
	Handle: PopupHandle,
	createHandle: createDialogHandle
};

export { createDialogHandle };
export type { DialogHandle } from './handle.svelte.js';
export type * from './types.js';
