import PreviewCardArrow from './PreviewCardArrow.svelte';
import PreviewCardBackdrop from './PreviewCardBackdrop.svelte';
import PreviewCardPopup from './PreviewCardPopup.svelte';
import PreviewCardPortal from './PreviewCardPortal.svelte';
import PreviewCardPositioner from './PreviewCardPositioner.svelte';
import PreviewCardRoot from './PreviewCardRoot.svelte';
import PreviewCardTrigger from './PreviewCardTrigger.svelte';
import PreviewCardViewport from './PreviewCardViewport.svelte';
import { PreviewCardHandle, createPreviewCardHandle } from './handle.svelte.js';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const PreviewCard = {
	Root: PreviewCardRoot as typeof PreviewCardRoot,
	Trigger: PreviewCardTrigger as typeof PreviewCardTrigger,
	Portal: PreviewCardPortal,
	Positioner: PreviewCardPositioner,
	Popup: PreviewCardPopup,
	Arrow: PreviewCardArrow,
	Backdrop: PreviewCardBackdrop,
	Viewport: PreviewCardViewport,
	Handle: PreviewCardHandle,
	createHandle: createPreviewCardHandle
};

export { PreviewCardHandle, createPreviewCardHandle };
export type * from './types.js';
export * from './data-attributes.js';
