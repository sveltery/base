import PopoverArrow from './PopoverArrow.svelte';
import PopoverBackdrop from './PopoverBackdrop.svelte';
import PopoverClose from './PopoverClose.svelte';
import PopoverDescription from './PopoverDescription.svelte';
import PopoverPopup from './PopoverPopup.svelte';
import PopoverPortal from './PopoverPortal.svelte';
import PopoverPositioner from './PopoverPositioner.svelte';
import PopoverRoot from './PopoverRoot.svelte';
import PopoverTitle from './PopoverTitle.svelte';
import PopoverTrigger from './PopoverTrigger.svelte';
import PopoverViewport from './PopoverViewport.svelte';
import { createPopoverHandle } from './handle.svelte.js';

export const Popover = {
	Root: PopoverRoot,
	Trigger: PopoverTrigger,
	Portal: PopoverPortal,
	Positioner: PopoverPositioner,
	Popup: PopoverPopup,
	Arrow: PopoverArrow,
	Backdrop: PopoverBackdrop,
	Title: PopoverTitle,
	Description: PopoverDescription,
	Close: PopoverClose,
	Viewport: PopoverViewport,
	createHandle: createPopoverHandle
};

export { createPopoverHandle as createHandle, PopoverHandle } from './handle.svelte.js';
export type * from './types.js';
