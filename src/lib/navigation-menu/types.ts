// Prop and state types of the navigation menu parts.
// Derived from the part types in Base UI v1.9.0 packages/react/src/navigation-menu/**/NavigationMenu*.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type {
	HTMLAnchorAttributes,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLLiAttributes
} from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, Side, AnchorPositioningParameters } from '../internal/popups/index.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { LINK_PRESS_REASON } from './constants.js';

export type { Align, Side };

export type NavigationMenuOrientation = 'horizontal' | 'vertical';
export type NavigationMenuActivationDirection = 'left' | 'right' | 'up' | 'down' | null;

export type NavigationMenuChangeReason =
	| typeof REASONS.triggerPress
	| typeof REASONS.triggerHover
	| typeof REASONS.outsidePress
	| typeof REASONS.listNavigation
	| typeof REASONS.focusOut
	| typeof REASONS.escapeKey
	| typeof LINK_PRESS_REASON
	| typeof REASONS.imperativeAction
	| typeof REASONS.none;

export type NavigationMenuChangeEventDetails =
	BaseUIChangeEventDetails<NavigationMenuChangeReason> & {
		/** Prevents the popup from unmounting until the root's `unmount` export is called. */
		preventUnmountOnClose: () => void;
	};

export interface NavigationMenuActions {
	unmount: () => void;
	close: () => void;
}

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface NavigationMenuRootState {
	/** Whether the popup is open. */
	open: boolean;
	/** Whether the navigation menu is nested in another one. */
	nested: boolean;
}

export interface NavigationMenuRootProps<Value = unknown> extends Omit<
	HTMLAttributes<HTMLElement>,
	'children'
> {
	/**
	 * The value of the item whose content is open. A nullish value closes the menu.
	 * Use `bind:value` to share it with the parent.
	 * A value passed without `bind:` holds until the parent changes it.
	 * @default null
	 */
	value?: Value | null;
	/** Called before the value changes. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: Value | null, eventDetails: NavigationMenuChangeEventDetails) => void;
	/** Called after any animations complete when the navigation menu is closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * How long to wait before opening the navigation popup, in milliseconds.
	 * @default 50
	 */
	delay?: number;
	/**
	 * How long to wait before closing the navigation popup, in milliseconds.
	 * @default 50
	 */
	closeDelay?: number;
	/**
	 * The orientation of the navigation menu.
	 * @default 'horizontal'
	 */
	orientation?: NavigationMenuOrientation;
	/** Replace the `<nav>` element, or the `<div>` of a nested root. */
	render?: PartRender<HTMLElement, NavigationMenuRootState>;
	children?: Snippet;
}

export interface NavigationMenuListState {
	/** Whether the popup is open. */
	open: boolean;
}

export interface NavigationMenuListProps extends Omit<
	HTMLAttributes<HTMLUListElement>,
	'children'
> {
	render?: PartRender<HTMLUListElement, NavigationMenuListState>;
	children?: Snippet;
}

export type NavigationMenuItemState = Record<string, never>;

export interface NavigationMenuItemProps extends Omit<HTMLLiAttributes, 'children' | 'value'> {
	/**
	 * A unique value that identifies this item.
	 * An id is generated when no value is passed.
	 * Use it when controlling the navigation menu programmatically.
	 */
	value?: unknown;
	render?: PartRender<HTMLLIElement, NavigationMenuItemState>;
	children?: Snippet;
}

export interface NavigationMenuTriggerState {
	/** Whether the popup is open and this item is active. */
	open: boolean;
	/** Whether the trigger ignores user interaction. */
	disabled: boolean;
}

export type NavigationMenuTriggerHostProps = HTMLButtonAttributes;

export interface NavigationMenuTriggerProps extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled'
> {
	/**
	 * Whether the trigger ignores user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	render?: Snippet<
		[
			props: NavigationMenuTriggerHostProps,
			state: NavigationMenuTriggerState,
			children: RenderChildren
		]
	>;
	children?: Snippet;
}

export interface NavigationMenuIconState {
	/** Whether the popup is open and this item is active. */
	open: boolean;
}

export interface NavigationMenuIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	render?: PartRender<HTMLSpanElement, NavigationMenuIconState>;
	/** Replaces the default `▼` glyph. */
	children?: Snippet;
}

export interface NavigationMenuContentState {
	/** Whether this content is the open one. */
	open: boolean;
	transitionStatus: TransitionStatusValue;
	/** The direction the active trigger moved in when the content changed. */
	activationDirection: NavigationMenuActivationDirection;
}

export interface NavigationMenuContentProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	/**
	 * Whether to keep the content mounted while the popup is closed.
	 * The content is then present in server-rendered HTML for crawlers.
	 * @default false
	 */
	keepMounted?: boolean;
	render?: PartRender<HTMLDivElement, NavigationMenuContentState>;
	children?: Snippet;
}

export interface NavigationMenuLinkState {
	/** Whether the link is the current page. */
	active: boolean;
}

export interface NavigationMenuLinkProps extends Omit<HTMLAnchorAttributes, 'children'> {
	/**
	 * Whether the link is the current page.
	 * @default false
	 */
	active?: boolean;
	/**
	 * Whether clicking the link closes the navigation menu.
	 * @default false
	 */
	closeOnClick?: boolean;
	render?: Snippet<
		[props: HTMLAnchorAttributes, state: NavigationMenuLinkState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type NavigationMenuPortalState = Record<string, never>;

export interface NavigationMenuPortalProps extends PortalProps {
	/**
	 * Replace the portal element. The snippet receives host props, an empty state, and the children snippet.
	 * Host props include the move attachment.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: NavigationMenuPortalState,
			children: RenderChildren
		]
	>;
}

export interface NavigationMenuPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	/** Whether CSS transitions should be disabled. */
	instant: boolean;
}

export interface NavigationMenuPositionerProps extends Omit<
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
	 *
	 * @example
	 * ```svelte
	 * <NavigationMenu.Positioner
	 *   sideOffset={({ side, anchor }) =>
	 *     side === 'top' || side === 'bottom' ? anchor.height : anchor.width}
	 * />
	 * ```
	 *
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
	 *
	 * @example
	 * ```svelte
	 * <NavigationMenu.Positioner
	 *   alignOffset={({ side, anchor }) =>
	 *     side === 'top' || side === 'bottom' ? anchor.width : anchor.height}
	 * />
	 * ```
	 *
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
	 *
	 * @example
	 * ```svelte
	 * <NavigationMenu.Positioner
	 *   collisionAvoidance={{ side: 'shift', align: 'shift', fallbackAxisSide: 'none' }}
	 * />
	 * ```
	 *
	 * Defaults to `{ fallbackAxisSide: 'none' }`, and to `{ fallbackAxisSide: 'end' }` in a nested menu.
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
	render?: PartRender<HTMLDivElement, NavigationMenuPositionerState>;
	children?: Snippet;
}

export interface NavigationMenuPopupState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
	side: Side;
	align: Align;
	anchorHidden: boolean;
}

export interface NavigationMenuPopupProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	render?: PartRender<HTMLElement, NavigationMenuPopupState>;
	children?: Snippet;
}

export interface NavigationMenuArrowState {
	open: boolean;
	side: Side;
	align: Align;
	uncentered: boolean;
}

export interface NavigationMenuArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, NavigationMenuArrowState>;
	children?: Snippet;
}

export interface NavigationMenuBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface NavigationMenuBackdropProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	render?: PartRender<HTMLDivElement, NavigationMenuBackdropState>;
	children?: Snippet;
}

export type NavigationMenuViewportState = Record<string, never>;

export interface NavigationMenuViewportProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	render?: PartRender<HTMLDivElement, NavigationMenuViewportState>;
	children?: Snippet;
}
