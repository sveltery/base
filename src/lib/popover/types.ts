import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, Side, UseAnchorPositioningParameters } from '../internal/popups/index.js';
import type { PopupTransitionStatus } from '../internal/useTransitionStatus.svelte.js';
import type { PopoverHandle } from './handle.svelte.js';

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
	[props: HTMLAttributes<Element>, state: State, children: Snippet]
>;

export interface PopoverRootProps<Payload = unknown> {
	/**
	 * Whether the popover is open.
	 * Use `bind:open` to share it with the parent.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Initial open state when `open` is left unset.
	 * @default false
	 */
	defaultOpen?: boolean;
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, details: PopoverChangeEventDetails) => void;
	/** Called after the open or close transition finishes. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * `true` limits interaction to the popover. `'trap-focus'` traps focus without a backdrop.
	 * @default false
	 */
	modal?: PopoverModal;
	/**
	 * Id of the trigger that owns the popover. A string wins over the trigger that opened it.
	 */
	triggerId?: string | null;
	/**
	 * Initial trigger id when `triggerId` is left unset.
	 */
	defaultTriggerId?: string | null;
	/** Associates detached triggers and imperative `open`, `close`, and `unmount`. */
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
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	handle?: PopoverHandle<Payload>;
	payload?: Payload;
	id?: string;
	/** Opens the popover when the pointer rests on the trigger. @default false */
	openOnHover?: boolean;
	/** Hover open delay in milliseconds. @default 300 */
	delay?: number;
	/** Hover close delay in milliseconds. @default 0 */
	closeDelay?: number;
	render?: Snippet<[props: PopoverTriggerHostProps, state: PopoverTriggerState, children: Snippet]>;
	children?: Snippet;
}

export interface PopoverPortalProps extends PortalProps {
	/**
	 * Replace the portal element. The snippet receives host props, an empty state, and the children snippet.
	 */
	render?: PartRender<HTMLDivElement, Record<string, never>>;
}

export interface PopoverPositionerState {
	open: boolean;
	side: Side;
	align: Align;
	anchorHidden: boolean;
	instant: PopoverInstant | undefined;
}

export interface PopoverPositionerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	anchor?: UseAnchorPositioningParameters['anchor'];
	positionMethod?: UseAnchorPositioningParameters['positionMethod'];
	side?: Side;
	align?: Align;
	sideOffset?: UseAnchorPositioningParameters['sideOffset'];
	alignOffset?: UseAnchorPositioningParameters['alignOffset'];
	collisionBoundary?: UseAnchorPositioningParameters['collisionBoundary'];
	collisionPadding?: UseAnchorPositioningParameters['collisionPadding'];
	arrowPadding?: number;
	sticky?: boolean;
	disableAnchorTracking?: boolean;
	collisionAvoidance?: UseAnchorPositioningParameters['collisionAvoidance'];
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
	transitionStatus: PopupTransitionStatus;
	instant: PopoverInstant | undefined;
}

export interface PopoverPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Element to focus when the popover opens.
	 * A function receives the open method. `true` and `null` use the default.
	 * Touch focuses the popup itself so the virtual keyboard stays closed.
	 */
	initialFocus?: FocusTarget;
	/**
	 * Element to focus when the popover closes.
	 * A function receives the close interaction.
	 * `null` falls back to the trigger. `true` returns focus there when it is still inside.
	 */
	finalFocus?: FocusTarget;
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
	render?: PartRender<HTMLDivElement, PopoverArrowState>;
	children?: Snippet;
}

export interface PopoverBackdropState {
	open: boolean;
	transitionStatus: PopupTransitionStatus;
}

export interface PopoverBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, PopoverBackdropState>;
	children?: Snippet;
}

export interface PopoverTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	render?: Snippet<[props: HTMLAttributes<HTMLHeadingElement>, children: Snippet]>;
	children?: Snippet;
}

export interface PopoverDescriptionProps extends Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children'
> {
	render?: Snippet<[props: HTMLAttributes<HTMLParagraphElement>, children: Snippet]>;
	children?: Snippet;
}

export interface PopoverCloseProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	disabled?: boolean;
	nativeButton?: boolean;
	render?: Snippet<[props: HTMLButtonAttributes, children: Snippet]>;
	children?: Snippet;
}

export interface PopoverViewportState {
	activationDirection: string | undefined;
	transitioning: boolean;
	instant: PopoverInstant | undefined;
}

export interface PopoverViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, PopoverViewportState>;
	children?: Snippet;
}
