// Derived from Base UI v1.9.0 packages/react/src/scroll-area/root/ScrollAreaRootContext.ts,
// viewport/ScrollAreaViewportContext.ts, and scrollbar/ScrollAreaScrollbarContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { ScrollAreaModel } from './model.svelte.js';
import type { ScrollAxis } from './types.js';
import { defineContext } from '../internal/context.js';

export interface ScrollbarContext {
	readonly orientation: ScrollAxis;
}

export const [useScrollAreaRootContext, setScrollAreaContext] = defineContext<ScrollAreaModel>(
	'Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.'
);

export const [useScrollAreaViewportContext, setScrollAreaViewportContext] =
	defineContext<ScrollAreaModel>(
		'Base UI: ScrollAreaViewportContext missing. ScrollAreaViewport parts must be placed within <ScrollArea.Viewport>.'
	);

export const [useScrollAreaScrollbarContext, setScrollAreaScrollbarContext] =
	defineContext<ScrollbarContext>(
		'Base UI: ScrollAreaScrollbarContext is missing. ScrollAreaScrollbar parts must be placed within <ScrollArea.Scrollbar>.'
	);
