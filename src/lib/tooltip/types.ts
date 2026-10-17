import type { Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, Side, AnchorPositioningParameters } from '../internal/popups/index.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { TooltipHandle } from './handle.svelte.js';

export type { Align, Side };

export type TooltipInstant = 'delay' | 'dismiss' | 'focus';
export type TrackCursorAxis = 'none' | 'x' | 'y' | 'both';

export type TooltipChangeReason =
	| typeof REASONS.triggerHover
	| 'trigger-focus'
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.escapeKey
	| typeof REASONS.disabled
	| typeof REASONS.imperativeAction
	| typeof REASONS.none;

export type TooltipChangeEventDetails = BaseUIChangeEventDetails<TooltipChangeReason> & {
	/** Keeps the popup mounted until `unmount()` is called on the root. */
	preventUnmountOnClose: () => void;
};

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface TooltipProviderProps {
	/** How long to wait before opening the tooltip on hover. Specified in milliseconds. */
	delay?: number;
	/** How long to wait before closing a tooltip. Specified in milliseconds. */
	closeDelay?: number;
	/**
	 * Another tooltip will open instantly if the previous tooltip
	 * is closed within this timeout. Specified in milliseconds.
	 * @default 400
	 */
	timeout?: number;
	children?: Snippet;
}

/** What `bind:this` on `Tooltip.Root` exposes, replacing upstream's `actionsRef`. */
export interface TooltipActions {
	unmount: () => void;
	close: () => void;
}

export interface TooltipRootProps<Payload = unknown> {
	/**
	 * Whether the tooltip is currently open.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Whether the tooltip is initially open.
	 *
	 * To render a controlled tooltip, use `bind:open` instead.
	 * @default false
	 */
	defaultOpen?: boolean;
	/** Event handler called when the tooltip is opened or closed. */
	onOpenChange?: (open: boolean, details: TooltipChangeEventDetails) => void;
	/** Event handler called after any animations complete when the tooltip is opened or closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Whether the tooltip contents can be hovered without closing the tooltip.
	 * @default false
	 */
	disableHoverablePopup?: boolean;
	/**
	 * Determines which axis the tooltip should track the cursor on.
	 * @default 'none'
	 */
	trackCursorAxis?: TrackCursorAxis;
	/**
	 * Whether the tooltip is disabled.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * ID of the trigger that the tooltip is associated with.
	 * This is useful in conjunction with `bind:open` to create a controlled tooltip.
	 * There's no need to specify this prop when the tooltip is uncontrolled (that is, when `open` is not bound).
	 */
	triggerId?: string | null;
	/**
	 * ID of the trigger that the tooltip is associated with.
	 * This is useful in conjunction with the `defaultOpen` prop to create an initially open tooltip.
	 */
	defaultTriggerId?: string | null;
	/**
	 * A handle to associate the tooltip with a trigger.
	 * If specified, allows external triggers to control the tooltip's open state.
	 * Can be created with the Tooltip.createHandle() method.
	 */
	handle?: TooltipHandle<Payload>;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export interface TooltipTriggerState {
	/** Whether the tooltip is open and was opened by this trigger. */
	open: boolean;
}

export type TooltipTriggerHostProps = HTMLButtonAttributes;

export interface TooltipTriggerProps<Payload = unknown> extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'id'
> {
	/** A handle to associate the trigger with a tooltip. */
	handle?: TooltipHandle<Payload>;
	/** A payload to pass to the tooltip when it is opened. */
	payload?: Payload;
	id?: string | null;
	/**
	 * How long to wait before opening the tooltip on hover. Specified in milliseconds.
	 * @default 600
	 */
	delay?: number;
	/**
	 * Whether the tooltip should close when this trigger is clicked.
	 * @default true
	 */
	closeOnClick?: boolean;
	/**
	 * How long to wait before closing the tooltip. Specified in milliseconds.
	 * @default 0
	 */
	closeDelay?: number;
	/**
	 * If `true`, the tooltip will not open when interacting with this trigger.
	 * Note that this doesn't apply the `disabled` attribute to the trigger element.
	 * If you want to disable the trigger element itself, you can pass the `disabled` prop to the trigger element via the `render` prop.
	 */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: TooltipTriggerHostProps, state: TooltipTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type TooltipPortalState = Record<string, never>;

export interface TooltipPortalProps extends PortalProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: TooltipPortalState,
			children: RenderChildren
		]
	>;
}

export interface TooltipPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	/** `'tracking-cursor'` while the tooltip follows the cursor. */
	instant: TooltipInstant | 'tracking-cursor' | undefined;
}

export interface TooltipPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * An element to position the popup against.
	 * By default, the popup will be positioned against the trigger.
	 */
	anchor?: AnchorPositioningParameters['anchor'];
	/**
	 * Determines which CSS `position` property to use.
	 *  @default 'absolute'
	 */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor element to align the popup against.
	 * May automatically change to avoid collisions.
	 * @default 'top'
	 */
	side?: Side;
	/**
	 * How to align the popup relative to the specified side.
	 *  @default 'center'
	 */
	align?: Align;
	/**
	 * Distance between the anchor and the popup in pixels.
	 * Also accepts a function that returns the distance to read the dimensions of the anchor
	 * and positioner elements, along with its side and alignment.
	 *
	 * The function takes a `data` object parameter with the following properties:
	 * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
	 * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
	 * - `data.side`: which side of the anchor element the positioner is aligned against.
	 * - `data.align`: how the positioner is aligned relative to the specified side.
	 *  @default 0
	 */
	sideOffset?: AnchorPositioningParameters['sideOffset'];
	/**
	 * Additional offset along the alignment axis in pixels.
	 * Also accepts a function that returns the offset to read the dimensions of the anchor
	 * and positioner elements, along with its side and alignment.
	 *
	 * The function takes a `data` object parameter with the following properties:
	 * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
	 * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
	 * - `data.side`: which side of the anchor element the positioner is aligned against.
	 * - `data.align`: how the positioner is aligned relative to the specified side.
	 *  @default 0
	 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/**
	 * An element or a rectangle that delimits the area that the popup is confined to.
	 *  @default 'clipping-ancestors'
	 */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/**
	 * Additional space to maintain from the edge of the collision boundary.
	 *  @default 5
	 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/**
	 * Minimum distance to maintain between the arrow and the edges of the popup.
	 *
	 * Use it to prevent the arrow element from hanging out of the rounded corners of a popup.
	 *  @default 5
	 */
	arrowPadding?: number;
	/**
	 * Whether to maintain the popup in the viewport after
	 * the anchor element was scrolled out of view.
	 *  @default false
	 */
	sticky?: boolean;
	/**
	 * Whether to disable the popup from tracking any layout shift of its positioning anchor.
	 *  @default false
	 */
	disableAnchorTracking?: boolean;
	/**
	 * Determines how to handle collisions when positioning the popup.
	 *
	 * `side` controls overflow on the preferred placement axis (`top`/`bottom` or `left`/`right`):
	 * - `'flip'`: keep the requested side when it fits; otherwise try the opposite side
	 *   (`top` and `bottom`, or `left` and `right`).
	 * - `'shift'`: never change side; keep the requested side and move the popup within
	 *   the clipping boundary so it stays visible.
	 * - `'none'`: do not correct side-axis overflow.
	 *
	 * `align` controls overflow on the alignment axis (`start`/`center`/`end`):
	 * - `'flip'`: keep side, but swap `start` and `end` when the requested alignment overflows.
	 * - `'shift'`: keep side and requested alignment, then nudge the popup along the
	 *   alignment axis to fit.
	 * - `'none'`: do not correct alignment-axis overflow.
	 *
	 * `fallbackAxisSide` controls fallback behavior on the perpendicular axis when the
	 * preferred axis cannot fit:
	 * - `'start'`: allow perpendicular fallback and try the logical start side first
	 *   (`top` before `bottom`, or `left` before `right` in LTR).
	 * - `'end'`: allow perpendicular fallback and try the logical end side first
	 *   (`bottom` before `top`, or `right` before `left` in LTR).
	 * - `'none'`: do not fallback to the perpendicular axis.
	 *
	 * When `side` is `'shift'`, explicitly setting `align` only supports `'shift'` or `'none'`.
	 * If `align` is omitted, it defaults to `'flip'`.
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, TooltipPositionerState>;
	children?: Snippet;
}

export interface TooltipPopupState {
	open: boolean;
	side: Side;
	align: Align;
	instant: TooltipInstant | undefined;
	transitionStatus: TransitionStatusValue;
}

export interface TooltipPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, TooltipPopupState>;
	children?: Snippet;
}

export interface TooltipArrowState {
	open: boolean;
	side: Side;
	align: Align;
	uncentered: boolean;
	instant: TooltipInstant | undefined;
}

export interface TooltipArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, TooltipArrowState>;
	children?: Snippet;
}

export interface TooltipViewportState {
	/**
	 * The direction from the previous trigger to the new one, as a horizontal and a vertical
	 * value separated by a space. Either value is empty when that axis did not move.
	 */
	activationDirection: string | undefined;
	transitioning: boolean;
	instant: TooltipInstant | undefined;
}

export interface TooltipViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, TooltipViewportState>;
	children?: Snippet;
}
