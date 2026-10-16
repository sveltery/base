import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, Side, AnchorPositioningParameters } from '../internal/popups/index.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { PopoverHandle } from './handle.svelte.js';
import type { RenderChildren } from '../internal/render-children.js';

export type { Align, Side };

export type PopoverModal = boolean | 'trap-focus';
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard';
export type PopoverInstant = 'dismiss' | 'click' | 'focus' | 'trigger-change';

export type PopoverChangeReason =
	| typeof REASONS.triggerHover
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.escapeKey
	| typeof REASONS.closePress
	| typeof REASONS.focusOut
	| typeof REASONS.imperativeAction
	| typeof REASONS.none
	| 'trigger-focus';

export type PopoverChangeEventDetails = BaseUIChangeEventDetails<PopoverChangeReason> & {
	preventUnmountOnClose: () => void;
};

export type FocusTarget =
	boolean | HTMLElement | null | ((interaction: string) => void | boolean | HTMLElement | null);

export interface PopoverActions {
	unmount: () => void;
	close: () => void;
}

export interface PopoverRootState {
	open: boolean;
	modal: PopoverModal;
	payload: unknown;
}

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface PopoverRootProps<Payload = unknown> {
	/**
	 * Whether the popover is currently open.
	 * @default false
	 */
	open?: boolean;
	/** Event handler called when the popover is opened or closed. */
	onOpenChange?: (open: boolean, details: PopoverChangeEventDetails) => void;
	/** Event handler called after any animations complete when the popover is opened or closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Determines if the popover enters a modal state when open.
	 * - `true`: user interaction is limited to the popover: document page scroll is locked, and pointer interactions on outside elements are disabled.
	 * - `false`: user interaction with the rest of the document is allowed.
	 * - `'trap-focus'`: focus is trapped inside the popover, but document page scroll is not locked and pointer interactions outside of it remain enabled.
	 *
	 * On touch devices, a `true` modal blocks outside taps but leaves the page scrollable unless the popup spans nearly the full viewport width, matching native iOS behavior.
	 *
	 * When `modal` is `true`, focus trapping is enabled only if `<Popover.Close>` is rendered
	 * inside `<Popover.Popup>`. It can be visually hidden with your own CSS if needed, such as
	 * Tailwind's `sr-only` utility.
	 *
	 * When `modal` is `'trap-focus'`, render `<Popover.Close>` inside `<Popover.Popup>` so touch
	 * screen readers can escape the popup.
	 * @default false
	 */
	modal?: PopoverModal;
	/**
	 * ID of the trigger that the popover is associated with.
	 * This is useful in conjunction with `bind:open` to create a controlled popover.
	 * There's no need to specify this prop when the popover is uncontrolled (that is, when `open` is not bound).
	 */
	triggerId?: string | null;
	/**
	 * A handle to associate the popover with a trigger.
	 * If specified, allows external triggers to control the popover's open state.
	 */
	handle?: PopoverHandle<Payload>;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export interface PopoverTriggerState {
	disabled: boolean;
	/** Whether the popover is open and was opened by this trigger. */
	open: boolean;
}

export type PopoverTriggerHostProps = HTMLButtonAttributes;

export interface PopoverTriggerProps<Payload = unknown> extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'id'
> {
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** A handle to associate the trigger with a popover. */
	handle?: PopoverHandle<Payload>;
	/** A payload to pass to the popover when it is opened. */
	payload?: Payload;
	/**
	 * ID of the trigger. In addition to being forwarded to the rendered element, it is also used to specify the active trigger for the popover in controlled mode (with the Popover.Root `triggerId` prop).
	 */
	id?: string | null;
	/**
	 * Whether the popover should also open when the trigger is hovered.
	 * @default false
	 */
	openOnHover?: boolean;
	/**
	 * How long to wait before the popover may be opened on hover. Specified in milliseconds.
	 *
	 * Requires the `openOnHover` prop.
	 * @default 300
	 */
	delay?: number;
	/**
	 * How long to wait before closing the popover that was opened on hover.
	 * Specified in milliseconds.
	 *
	 * Requires the `openOnHover` prop.
	 * @default 0
	 */
	closeDelay?: number;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: PopoverTriggerHostProps, state: PopoverTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type PopoverPortalState = Record<string, never>;

export interface PopoverPortalProps extends PortalProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: PopoverPortalState,
			children: RenderChildren
		]
	>;
}

export interface PopoverPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	instant: PopoverInstant | undefined;
}

export interface PopoverPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
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
	 * <Popover.Positioner
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
	 * <Popover.Positioner
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
	 * <Popover.Positioner
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
	render?: PartRender<HTMLDivElement, PopoverPositionerState>;
	children?: Snippet;
}

export interface OffsetData {
	side: Side;
	align: Align;
	anchor: { width: number; height: number };
	positioner: { width: number; height: number };
}

export interface PopoverPopupState {
	open: boolean;
	side: Side;
	align: Align;
	transitionStatus: TransitionStatusValue;
	instant: PopoverInstant | undefined;
}

export interface PopoverPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Determines the element to focus when the popover is opened.
	 * By default, focus moves to the first tabbable element inside the popup, except when the popover
	 * is opened by touch — then the popup itself is focused to avoid opening the virtual keyboard.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (first tabbable element or popup).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, `null` to fall back to the default behavior, or `false`/`undefined` to do nothing.
	 */
	initialFocus?: FocusTarget;
	/**
	 * Determines the element to focus when the popover is closed.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (trigger or previously focused element).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, `null` to fall back to the default behavior, or `false`/`undefined` to do nothing.
	 */
	finalFocus?: FocusTarget;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, PopoverPopupState>;
	children?: Snippet;
}

export interface PopoverArrowState {
	open: boolean;
	side: Side;
	align: Align;
	uncentered: boolean;
}

export interface PopoverArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, PopoverArrowState>;
	children?: Snippet;
}

export interface PopoverBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface PopoverBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, PopoverBackdropState>;
	children?: Snippet;
}

export type PopoverTitleState = Record<string, never>;

export interface PopoverTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLHeadingElement>, state: PopoverTitleState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface PopoverDescriptionProps extends Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLParagraphElement>,
			state: PopoverDescriptionState,
			children: RenderChildren
		]
	>;
	children?: Snippet;
}

export type PopoverDescriptionState = Record<string, never>;

export type PopoverCloseState = Record<string, never>;

export interface PopoverCloseProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 */
	nativeButton?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLButtonAttributes, state: PopoverCloseState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface PopoverViewportState {
	/**
	 * The direction from the previous trigger to the new one, as a horizontal and a vertical
	 * value separated by a space. Either value is empty when that axis did not move,
	 * so `'right '` and `' down'` are valid, as in Base UI.
	 */
	activationDirection: string | undefined;
	transitioning: boolean;
	instant: PopoverInstant | undefined;
}

export interface PopoverViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, PopoverViewportState>;
	children?: Snippet;
}
