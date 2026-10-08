import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

export type ScrollAxis = 'vertical' | 'horizontal';
export type TextDirection = 'ltr' | 'rtl';

export interface Size {
	width: number;
	height: number;
}

export interface Coords {
	x: number;
	y: number;
}

export interface HiddenState {
	x: boolean;
	y: boolean;
	corner: boolean;
}

export interface OverflowEdges {
	xStart: boolean;
	xEnd: boolean;
	yStart: boolean;
	yEnd: boolean;
}

export type OverflowEdgeThreshold =
	| number
	| Partial<{
			xStart: number;
			xEnd: number;
			yStart: number;
			yEnd: number;
	  }>;

export interface NormalizedThreshold {
	xStart: number;
	xEnd: number;
	yStart: number;
	yEnd: number;
}

export interface ScrollAreaRootState {
	/** Whether the scroll area is being scrolled. */
	scrolling: boolean;
	/** Whether horizontal overflow is present. */
	hasOverflowX: boolean;
	/** Whether vertical overflow is present. */
	hasOverflowY: boolean;
	/** Whether there is overflow on the inline start side for the horizontal axis. */
	overflowXStart: boolean;
	/** Whether there is overflow on the inline end side for the horizontal axis. */
	overflowXEnd: boolean;
	/** Whether there is overflow on the block start side. */
	overflowYStart: boolean;
	/** Whether there is overflow on the block end side. */
	overflowYEnd: boolean;
	/** Whether the scrollbar corner is hidden. */
	cornerHidden: boolean;
}

export interface ScrollAreaScrollbarState extends ScrollAreaRootState {
	/** Whether the scroll area is being hovered. */
	hovering: boolean;
	/** Whether this scrollbar's axis is being scrolled. */
	scrolling: boolean;
	/** The orientation of the scrollbar. */
	orientation: ScrollAxis;
}

export interface ScrollAreaThumbState {
	/** Whether this thumb's axis is being scrolled. */
	scrolling: boolean;
	/** The component orientation. */
	orientation: ScrollAxis;
}

export type ScrollAreaViewportState = ScrollAreaRootState;
export type ScrollAreaContentState = ScrollAreaRootState;
export type ScrollAreaCornerState = Record<string, never>;

type PartRender<State> = Snippet<
	[props: HTMLAttributes<HTMLDivElement>, state: State, children: RenderChildren]
>;

export interface ScrollAreaRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The threshold in pixels that must be passed before the overflow edge attributes are applied.
	 * Accepts a single number for all edges or an object to configure them individually.
	 * @default 0
	 */
	overflowEdgeThreshold?: OverflowEdgeThreshold;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: PartRender<ScrollAreaRootState>;
	children?: Snippet;
}

export interface ScrollAreaViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: PartRender<ScrollAreaViewportState>;
	children?: Snippet;
}

export interface ScrollAreaScrollbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Whether the scrollbar controls vertical or horizontal scroll. @default 'vertical' */
	orientation?: ScrollAxis;
	/**
	 * Whether to keep the HTML element in the DOM when the viewport isn't scrollable.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: PartRender<ScrollAreaScrollbarState>;
	children?: Snippet;
}

export interface ScrollAreaThumbProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: PartRender<ScrollAreaThumbState>;
	children?: Snippet;
}

export interface ScrollAreaContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: PartRender<ScrollAreaContentState>;
	children?: Snippet;
}

export interface ScrollAreaCornerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: PartRender<ScrollAreaCornerState>;
	children?: Snippet;
}
