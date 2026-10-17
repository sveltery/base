import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, Side, AnchorPositioningParameters } from '../internal/popups/index.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { RenderChildren, RenderSnippet } from '../internal/render-children.js';
import type { PreviewCardHandle } from './handle.svelte.js';

export type { Align, Side };

export type PreviewCardInstant = 'dismiss' | 'focus';

export type PreviewCardChangeReason =
	| typeof REASONS.triggerHover
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.escapeKey
	| typeof REASONS.imperativeAction
	| typeof REASONS.none
	| 'trigger-focus';

export type PreviewCardChangeEventDetails = BaseUIChangeEventDetails<PreviewCardChangeReason> & {
	/** Prevents the popup from unmounting until the `unmount` action is called. */
	preventUnmountOnClose: () => void;
};

export interface PreviewCardActions {
	unmount: () => void;
	close: () => void;
}

export type PreviewCardRootState = Record<string, never>;

export interface PreviewCardRootProps<Payload = unknown> {
	/**
	 * Whether the preview card is currently open.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Whether the preview card is initially open.
	 *
	 * To render a controlled preview card, use `bind:open` instead.
	 * @default false
	 */
	defaultOpen?: boolean;
	/** Event handler called when the preview card is opened or closed. */
	onOpenChange?: (open: boolean, details: PreviewCardChangeEventDetails) => void;
	/**
	 * Event handler called after any animations complete when the preview card is opened or closed.
	 */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * ID of the trigger that the preview card is associated with.
	 * This is useful in conjunction with `bind:open` to create a controlled preview card.
	 * There's no need to specify this prop when the preview card is uncontrolled (that is, when `open` is not bound).
	 */
	triggerId?: string | null;
	/**
	 * ID of the trigger that the preview card is associated with.
	 * This is useful in conjunction with the `defaultOpen` prop to create an initially open preview card.
	 */
	defaultTriggerId?: string | null;
	/**
	 * A handle to associate the preview card with a trigger.
	 * If specified, allows external triggers to control the card's open state.
	 * Can be created with the PreviewCard.createHandle() method.
	 */
	handle?: PreviewCardHandle<Payload>;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export interface PreviewCardTriggerState {
	/** Whether the preview card is open and was opened by this trigger. */
	open: boolean;
}

export interface PreviewCardTriggerProps<Payload = unknown> extends Omit<
	HTMLAnchorAttributes,
	'children' | 'id'
> {
	/** A handle to associate the trigger with a preview card. */
	handle?: PreviewCardHandle<Payload>;
	/** A payload to pass to the preview card when it is opened. */
	payload?: Payload;
	id?: string | null;
	/**
	 * How long to wait before the preview card opens. Specified in milliseconds.
	 * @default 600
	 */
	delay?: number;
	/**
	 * How long to wait before closing the preview card. Specified in milliseconds.
	 * @default 300
	 */
	closeDelay?: number;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAnchorAttributes, state: PreviewCardTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type PreviewCardPortalState = Record<string, never>;

export interface PreviewCardPortalProps extends PortalProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: PreviewCardPortalState,
			children: RenderChildren
		]
	>;
}

export interface PreviewCardPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	instant: PreviewCardInstant | undefined;
}

export interface PreviewCardPositionerProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	/**
	 * An element to position the popup against.
	 * By default, the popup will be positioned against the trigger.
	 */
	anchor?: AnchorPositioningParameters['anchor'];
	/**
	 * Determines which CSS `position` property to use.
	 * @default 'absolute'
	 */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor element to align the popup against.
	 * May automatically change to avoid collisions.
	 * @default 'bottom'
	 */
	side?: Side;
	/**
	 * How to align the popup relative to the specified side.
	 * @default 'center'
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
	 * @example
	 * ```svelte
	 * <PreviewCard.Positioner
	 *   sideOffset={({ side, anchor }) =>
	 *     side === 'top' || side === 'bottom' ? anchor.height : anchor.width}
	 * />
	 * ```
	 * @default 0
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
	 * @example
	 * ```svelte
	 * <PreviewCard.Positioner
	 *   alignOffset={({ side, anchor }) =>
	 *     side === 'top' || side === 'bottom' ? anchor.width : anchor.height}
	 * />
	 * ```
	 * @default 0
	 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/**
	 * An element or a rectangle that delimits the area that the popup is confined to.
	 * @default 'clipping-ancestors'
	 */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/**
	 * Additional space to maintain from the edge of the collision boundary.
	 * @default 5
	 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/**
	 * Minimum distance to maintain between the arrow and the edges of the popup.
	 *
	 * Use it to prevent the arrow element from hanging out of the rounded corners of a popup.
	 * @default 5
	 */
	arrowPadding?: number;
	/**
	 * Whether to maintain the popup in the viewport after
	 * the anchor element was scrolled out of view.
	 * @default false
	 */
	sticky?: boolean;
	/**
	 * Whether to disable the popup from tracking any layout shift of its positioning anchor.
	 * @default false
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
	 * @example
	 * ```svelte
	 * <PreviewCard.Positioner
	 *   collisionAvoidance={{ side: 'shift', align: 'shift', fallbackAxisSide: 'none' }}
	 * />
	 * ```
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, PreviewCardPositionerState>;
	children?: Snippet;
}

export interface PreviewCardPopupState {
	open: boolean;
	side: Side;
	align: Align;
	transitionStatus: TransitionStatusValue;
	instant: PreviewCardInstant | undefined;
}

export interface PreviewCardPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, PreviewCardPopupState>;
	children?: Snippet;
}

export interface PreviewCardArrowState {
	open: boolean;
	side: Side;
	align: Align;
	uncentered: boolean;
}

export interface PreviewCardArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, PreviewCardArrowState>;
	children?: Snippet;
}

export interface PreviewCardBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface PreviewCardBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, PreviewCardBackdropState>;
	children?: Snippet;
}

export interface PreviewCardViewportState {
	/**
	 * The direction from the previous trigger to the new one, as a horizontal and a vertical
	 * value separated by a space. Either value is empty when that axis did not move,
	 * so `'right '` and `' down'` are valid, as in Base UI.
	 */
	activationDirection: string | undefined;
	transitioning: boolean;
	instant: PreviewCardInstant | undefined;
}

export interface PreviewCardViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, PreviewCardViewportState>;
	children?: Snippet;
}
