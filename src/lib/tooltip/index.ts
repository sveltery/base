import TooltipArrow from './TooltipArrow.svelte';
import TooltipPopup from './TooltipPopup.svelte';
import TooltipPortal from './TooltipPortal.svelte';
import TooltipPositioner from './TooltipPositioner.svelte';
import TooltipProvider from './TooltipProvider.svelte';
import TooltipRoot from './TooltipRoot.svelte';
import TooltipTrigger from './TooltipTrigger.svelte';
import TooltipViewport from './TooltipViewport.svelte';
import { TooltipHandle, createTooltipHandle } from './handle.svelte.js';

export const Tooltip = {
	Provider: TooltipProvider,
	Root: TooltipRoot,
	Trigger: TooltipTrigger,
	Portal: TooltipPortal,
	Positioner: TooltipPositioner,
	Popup: TooltipPopup,
	Arrow: TooltipArrow,
	Viewport: TooltipViewport,
	Handle: TooltipHandle,
	createHandle: createTooltipHandle
};

export { TooltipHandle, createTooltipHandle } from './handle.svelte.js';
export type * from './types.js';
