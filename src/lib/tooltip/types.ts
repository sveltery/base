import type { Snippet } from 'svelte';
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
	/** How long to wait before opening a tooltip on hover, in milliseconds. */
	delay?: number;
	/** How long to wait before closing a tooltip, in milliseconds. */
	closeDelay?: number;
	/**
	 * Another tooltip opens instantly if the previous one closed within this time, in milliseconds.
	 * @default 400
	 */
	timeout?: number;
	children?: Snippet;
}

export interface TooltipRootProps<Payload = unknown> {
	/**
	 * Whether the tooltip is open.
	 * Use `bind:open` to share it with the parent.
	 * A value passed without `bind:` holds until the parent changes it.
	 * @default false
	 */
	open?: boolean;
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, details: TooltipChangeEventDetails) => void;
	/** Called after the open or close transition finishes. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Whether the tooltip contents can be hovered without closing the tooltip.
	 * @default false
	 */
	disableHoverablePopup?: boolean;
	/**
	 * Which axis the tooltip follows the cursor on.
	 * @default 'none'
	 */
	trackCursorAxis?: TrackCursorAxis;
	/**
	 * Whether the tooltip is disabled.
	 * @default false
	 */
	disabled?: boolean;
	/** Id of the trigger the tooltip belongs to. Use `bind:triggerId` to follow it. */
	triggerId?: string | null;
	/** Associates detached triggers and imperative `open` and `close`. */
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
	handle?: TooltipHandle<Payload>;
	/** A payload passed to the tooltip when this trigger opens it. */
	payload?: Payload;
	id?: string;
	/**
	 * How long to wait before opening the tooltip on hover, in milliseconds.
	 * @default 600
	 */
	delay?: number;
	/**
	 * Whether the tooltip closes when this trigger is clicked.
	 * @default true
	 */
	closeOnClick?: boolean;
	/**
	 * How long to wait before closing the tooltip, in milliseconds.
	 * @default 0
	 */
	closeDelay?: number;
	/**
	 * Whether this trigger does not open the tooltip.
	 * It does not set the `disabled` attribute on the element.
	 * Defaults to the root's `disabled`.
	 */
	disabled?: boolean;
	render?: Snippet<
		[props: TooltipTriggerHostProps, state: TooltipTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type TooltipPortalProps = PortalProps;

export interface TooltipPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	/** `'tracking-cursor'` while the tooltip follows the cursor. */
	instant: TooltipInstant | 'tracking-cursor' | undefined;
}

export interface TooltipPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** An element to position the popup against. Defaults to the trigger. */
	anchor?: AnchorPositioningParameters['anchor'];
	/** @default 'absolute' */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor to place the popup on. May change to avoid collisions.
	 * @default 'top'
	 */
	side?: Side;
	/** @default 'center' */
	align?: Align;
	/** @default 0 */
	sideOffset?: AnchorPositioningParameters['sideOffset'];
	/** @default 0 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/** @default 'clipping-ancestors' */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/** @default 5 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/** @default 5 */
	arrowPadding?: number;
	/** @default false */
	sticky?: boolean;
	/** @default false */
	disableAnchorTracking?: boolean;
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
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
	render?: PartRender<HTMLDivElement, TooltipViewportState>;
	children?: Snippet;
}
