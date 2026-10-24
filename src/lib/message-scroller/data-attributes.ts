// Derived from @shadcn/react v0.3.1 packages/react/src/message-scroller/components.tsx and
// use-message-scroller-controller.ts (commit 30a58d4498f270af1c1e981a7d78a15cf5740841).
// MIT, see THIRD_PARTY_NOTICES.md.

export const MessageScrollerRootDataAttributes = {
	/**
	 * The edges the viewport can scroll toward: `start`, `end` or `start end`. Absent when the
	 * content fits. Match one edge with `[data-scrollable~="end"]`.
	 * @type {'start' | 'end' | 'start end'}
	 */
	scrollable: 'data-scrollable',
	/** Present while a programmatic scroll to the end runs. */
	autoscrolling: 'data-autoscrolling',
	/**
	 * Present until the `'end'` or `'last-anchor'` opening position is applied. Hide the viewport
	 * with `visibility: hidden` while it is set.
	 */
	pendingScroll: 'data-pending-scroll'
} as const;

export const MessageScrollerViewportDataAttributes = {
	/**
	 * The edges the viewport can scroll toward: `start`, `end` or `start end`. Absent when the
	 * content fits. Match one edge with `[data-scrollable~="end"]`.
	 * @type {'start' | 'end' | 'start end'}
	 */
	scrollable: 'data-scrollable',
	/** Present while a programmatic scroll to the end runs. */
	autoscrolling: 'data-autoscrolling',
	/**
	 * Present until the `'end'` or `'last-anchor'` opening position is applied. Hide the viewport
	 * with `visibility: hidden` while it is set.
	 */
	pendingScroll: 'data-pending-scroll'
} as const;

export const MessageScrollerItemDataAttributes = {
	/** The item's `messageId`. */
	messageId: 'data-message-id',
	/**
	 * Whether the item is a turn boundary.
	 * @type {'true' | 'false'}
	 */
	scrollAnchor: 'data-scroll-anchor'
} as const;

export const MessageScrollerButtonDataAttributes = {
	/**
	 * Whether the button can scroll toward its edge.
	 * @type {'true' | 'false'}
	 */
	active: 'data-active'
} as const;
