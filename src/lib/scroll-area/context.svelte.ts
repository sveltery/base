// Derived from Base UI v1.8.0 packages/react/src/scroll-area/root/ScrollAreaRootContext.ts,
// viewport/ScrollAreaViewportContext.ts, and scrollbar/ScrollAreaScrollbarContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { ScrollAreaModel } from './model.svelte.js';
import type { ScrollAxis } from './types.js';

const ROOT = Symbol('scroll-area-root');
const VIEWPORT = Symbol('scroll-area-viewport');
const SCROLLBAR = Symbol('scroll-area-scrollbar');

export interface ScrollbarContext {
	readonly orientation: ScrollAxis;
}

export function setScrollAreaContext(model: ScrollAreaModel) {
	setContext(ROOT, model);
}

export function useScrollAreaRootContext() {
	if (!hasContext(ROOT)) {
		throw new Error(
			'Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.'
		);
	}
	return getContext<ScrollAreaModel>(ROOT);
}

export function setScrollAreaViewportContext(model: ScrollAreaModel) {
	setContext(VIEWPORT, model);
}

export function useScrollAreaViewportContext() {
	if (!hasContext(VIEWPORT)) {
		throw new Error(
			'Base UI: ScrollAreaViewportContext missing. ScrollAreaViewport parts must be placed within <ScrollArea.Viewport>.'
		);
	}
	return getContext<ScrollAreaModel>(VIEWPORT);
}

export function setScrollAreaScrollbarContext(context: ScrollbarContext) {
	setContext(SCROLLBAR, context);
}

export function useScrollAreaScrollbarContext() {
	if (!hasContext(SCROLLBAR)) {
		throw new Error(
			'Base UI: ScrollAreaScrollbarContext is missing. ScrollAreaScrollbar parts must be placed within <ScrollArea.Scrollbar>.'
		);
	}
	return getContext<ScrollbarContext>(SCROLLBAR);
}
