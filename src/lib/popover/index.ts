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
import { PopoverHandle, createPopoverHandle } from './handle.svelte.js';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const Popover = {
	Root: PopoverRoot as typeof PopoverRoot,
	Trigger: PopoverTrigger as typeof PopoverTrigger,
	Portal: PopoverPortal,
	Positioner: PopoverPositioner,
	Popup: PopoverPopup,
	Arrow: PopoverArrow,
	Backdrop: PopoverBackdrop,
	Title: PopoverTitle,
	Description: PopoverDescription,
	Close: PopoverClose,
	Viewport: PopoverViewport,
	Handle: PopoverHandle,
	createHandle: createPopoverHandle
};

export { PopoverHandle, createPopoverHandle as createHandle } from './handle.svelte.js';
export type * from './types.js';
