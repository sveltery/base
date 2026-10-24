import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

/** Two fractional scrollTop values within this range are equal, to absorb zoom and HiDPI rounding drift. */
export const SCROLL_POSITION_EPSILON = 0.5;
/** Where a saved transcript opens on the first non-empty render. */
export type MessageScrollerDefaultScrollPosition = 'start' | 'end' | 'last-anchor';
/** Which transcript edge a scroll button scrolls toward. */
export type MessageScrollerButtonDirection = 'start' | 'end';
export type MessageScrollerScrollAlign = 'start' | 'center' | 'end' | 'nearest';

export interface MessageScrollerScrollOptions {
	/** Viewport edge or center to align the target to. @default 'start' */
	align?: MessageScrollerScrollAlign;
	/** Native scroll behavior. @default 'auto' */
	behavior?: ScrollBehavior;
	/** Margin on the aligned edge, in pixels. Defaults to the provider `scrollMargin`. */
	scrollMargin?: number;
}

/** Which edges the viewport can still scroll toward. */
export interface MessageScrollerScrollable {
	/** Content is hidden above. */
	start: boolean;
	/** Content is hidden below. */
	end: boolean;
}

export interface MessageScrollerVisibilityState {
	/** The anchored turn the reader is in, or null. Stays set after the anchor scrolls above the viewport. */
	currentAnchorId: string | null;
	/** `messageId` values intersecting the viewport, in document order. */
	visibleMessageIds: string[];
}

export const EMPTY_MESSAGE_SCROLLER_SCROLLABLE: MessageScrollerScrollable = {
	start: false,
	end: false
};
export const EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE: MessageScrollerVisibilityState = {
	currentAnchorId: null,
	visibleMessageIds: []
};

export interface MessageScrollerProviderProps {
	/** Follow new content at the bottom while the viewport is already at the end. @default false */
	autoScroll?: boolean;
	/** Opening position on the first non-empty render, applied once. @default 'end' */
	defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
	/** Distance from an edge that still counts as at the start or end. @default 8 */
	scrollEdgeThreshold?: number;
	/** Extra top margin for a newly anchored row, added to `scrollMargin`. @default 64 */
	scrollPreviousItemPeek?: number;
	/** Default margin on the aligned edge for commands and visibility. @default 0 */
	scrollMargin?: number;
	children?: Snippet;
}

export type MessageScrollerRootProps = HTMLAttributes<HTMLDivElement>;

export interface MessageScrollerViewportProps extends HTMLAttributes<HTMLDivElement> {
	/** Keep the first visible `messageId` row stable when rows are prepended. @default true */
	preserveScrollOnPrepend?: boolean;
}

export interface MessageScrollerContentProps extends HTMLAttributes<HTMLDivElement> {
	/** Class for the internal tail spacer used when anchoring turns near the top. */
	spacerClass?: string;
}

export interface MessageScrollerItemProps extends HTMLAttributes<HTMLDivElement> {
	/** Stable row id for `scrollToMessage`, visibility and prepend preservation. */
	messageId?: string;
	/** Marks a turn boundary that newly appended anchors and `last-anchor` restore use. @default false */
	scrollAnchor?: boolean;
}

export interface MessageScrollerButtonState {
	/** Whether content is hidden toward this button's direction. */
	active: boolean;
	direction: MessageScrollerButtonDirection;
}

export interface MessageScrollerButtonProps extends Omit<HTMLButtonAttributes, 'children'> {
	/** Native scroll behavior when clicked. @default 'smooth' */
	behavior?: ScrollBehavior;
	/** Transcript edge to scroll toward. @default 'end' */
	direction?: MessageScrollerButtonDirection;
	/** Replaces the default `<button>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLButtonAttributes, state: MessageScrollerButtonState]>;
	children?: Snippet;
}
