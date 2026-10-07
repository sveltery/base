import ScrollAreaContent from './ScrollAreaContent.svelte';
import ScrollAreaCorner from './ScrollAreaCorner.svelte';
import ScrollAreaRoot from './ScrollAreaRoot.svelte';
import ScrollAreaScrollbar from './ScrollAreaScrollbar.svelte';
import ScrollAreaThumb from './ScrollAreaThumb.svelte';
import ScrollAreaViewport from './ScrollAreaViewport.svelte';

export {
	ScrollAreaContent,
	ScrollAreaCorner,
	ScrollAreaRoot,
	ScrollAreaScrollbar,
	ScrollAreaThumb,
	ScrollAreaViewport
};

/** Compound parts matching Base UI `ScrollArea`. */
export const ScrollArea = {
	Root: ScrollAreaRoot,
	Viewport: ScrollAreaViewport,
	Scrollbar: ScrollAreaScrollbar,
	Content: ScrollAreaContent,
	Thumb: ScrollAreaThumb,
	Corner: ScrollAreaCorner
};

export type * from './types.js';
