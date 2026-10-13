import DialogClose from '../dialog/DialogClose.svelte';
import DialogDescription from '../dialog/DialogDescription.svelte';
import DialogPortal from '../dialog/DialogPortal.svelte';
import DialogTitle from '../dialog/DialogTitle.svelte';
import DrawerBackdrop from './DrawerBackdrop.svelte';
import DrawerContent from './DrawerContent.svelte';
import DrawerIndent from './DrawerIndent.svelte';
import DrawerIndentBackground from './DrawerIndentBackground.svelte';
import DrawerPopup from './DrawerPopup.svelte';
import DrawerProvider from './DrawerProvider.svelte';
import DrawerRoot from './DrawerRoot.svelte';
import DrawerSwipeArea from './DrawerSwipeArea.svelte';
import DrawerTrigger from './DrawerTrigger.svelte';
import DrawerViewport from './DrawerViewport.svelte';
import DrawerVirtualKeyboardProvider from './DrawerVirtualKeyboardProvider.svelte';
import { DrawerHandle, createDrawerHandle } from './handle.svelte.js';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const Drawer = {
	Root: DrawerRoot as typeof DrawerRoot,
	Trigger: DrawerTrigger as typeof DrawerTrigger,
	Portal: DialogPortal,
	Popup: DrawerPopup,
	Backdrop: DrawerBackdrop,
	Viewport: DrawerViewport,
	Title: DialogTitle,
	Description: DialogDescription,
	Close: DialogClose,
	SwipeArea: DrawerSwipeArea,
	Content: DrawerContent,
	Provider: DrawerProvider,
	Indent: DrawerIndent,
	IndentBackground: DrawerIndentBackground,
	VirtualKeyboardProvider: DrawerVirtualKeyboardProvider,
	Handle: DrawerHandle,
	createHandle: createDrawerHandle
};

export { DrawerHandle, createDrawerHandle };
export type * from './types.js';
