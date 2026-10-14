// Derived from Base UI v1.9.0 packages/react/src/drawer/index.ts and the part files' prop and
// state types (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Trigger, Portal, Title, Description, and Close are the Dialog parts, so their types are Dialog's.

import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type {
	DialogActions,
	DialogCloseProps,
	DialogCloseState,
	DialogDescriptionProps,
	DialogDescriptionState,
	DialogFocusTarget,
	DialogPortalProps,
	DialogPortalState,
	DialogRootProps,
	DialogTitleProps,
	DialogTitleState,
	DialogTriggerProps,
	DialogTriggerState
} from '../dialog/types.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { SwipeDirection } from '../internal/useSwipeDismiss.svelte.js';
import type { DrawerHandle } from './handle.svelte.js';
import type { DrawerSnapPoint } from './snap-points.js';

export type { DrawerSnapPoint };
export type DrawerSwipeDirection = SwipeDirection;

export type DrawerChangeEventReason =
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.escapeKey
	| typeof REASONS.closeWatcher
	| typeof REASONS.closePress
	| typeof REASONS.focusOut
	| typeof REASONS.imperativeAction
	| typeof REASONS.swipe
	| typeof REASONS.none;

export type DrawerChangeEventDetails = BaseUIChangeEventDetails<DrawerChangeEventReason> & {
	/** Keeps the popup mounted until the `unmount` action is called. */
	preventUnmountOnClose: () => void;
};

export type DrawerSnapPointChangeEventReason = DrawerChangeEventReason;
export type DrawerSnapPointChangeEventDetails =
	BaseUIChangeEventDetails<DrawerSnapPointChangeEventReason>;

/** Methods on the `Drawer.Root` instance. Reach them with `bind:this`. */
export type DrawerActions = DialogActions;
export type DrawerRootState = Record<string, never>;

type PartRender<Element extends EventTarget, State> = Snippet<
	[
		props: HTMLAttributes<Element> & Record<symbol, Attachment<Element>>,
		state: State,
		children: RenderChildren
	]
>;

export type DrawerDivProps = HTMLAttributes<HTMLDivElement> &
	Record<symbol, Attachment<HTMLDivElement>>;

export interface DrawerRootProps<Payload = unknown> extends Omit<
	DialogRootProps<Payload>,
	'handle' | 'onOpenChange'
> {
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: DrawerChangeEventDetails) => void;
	/** Connects detached triggers. Create one with `Drawer.createHandle()`. */
	handle?: DrawerHandle<Payload>;
	/**
	 * The direction a swipe dismisses the drawer in.
	 * @default 'down'
	 */
	swipeDirection?: DrawerSwipeDirection;
	/**
	 * Snap points that size the drawer. Numbers from 0 to 1 are fractions of the viewport height.
	 * Larger numbers are pixels. Strings take `px` or `rem` units, such as `'148px'` or `'30rem'`.
	 */
	snapPoints?: DrawerSnapPoint[];
	/**
	 * Let the drag distance pick the next snap point, without skipping on velocity.
	 * @default false
	 */
	snapToSequentialPoints?: boolean;
	/**
	 * The active snap point.
	 * Use `bind:snapPoint` to share it with the parent.
	 * A value outside `snapPoints` resolves to the closest snap point.
	 */
	snapPoint?: DrawerSnapPoint | null;
	/**
	 * The snap point the drawer starts at when `snapPoint` is unset and returns to when it closes.
	 * Defaults to the first of `snapPoints`.
	 */
	defaultSnapPoint?: DrawerSnapPoint | null;
	/** Called before the snap point changes. Call `eventDetails.cancel()` to veto it. */
	onSnapPointChange?: (
		snapPoint: DrawerSnapPoint | null,
		eventDetails: DrawerSnapPointChangeEventDetails
	) => void;
}

export interface DrawerTriggerProps<Payload = unknown> extends Omit<
	DialogTriggerProps<Payload>,
	'handle'
> {
	/** Associates this trigger with a drawer that is not its parent. */
	handle?: DrawerHandle<Payload>;
}

export type DrawerTriggerState = DialogTriggerState;
export type DrawerPortalProps = DialogPortalProps;
export type DrawerPortalState = DialogPortalState;
export type DrawerTitleProps = DialogTitleProps;
export type DrawerTitleState = DialogTitleState;
export type DrawerDescriptionProps = DialogDescriptionProps;
export type DrawerDescriptionState = DialogDescriptionState;
export type DrawerCloseProps = DialogCloseProps;
export type DrawerCloseState = DialogCloseState;

export interface DrawerPopupState {
	/** Whether the drawer is open. */
	open: boolean;
	/** Open/close motion phase. */
	transitionStatus: TransitionStatusValue;
	/** Whether the active snap point is the full-height one. */
	expanded: boolean;
	/** Whether the drawer is nested in a parent drawer. */
	nested: boolean;
	/** Whether a nested drawer is open. */
	nestedDrawerOpen: boolean;
	/** Whether a nested drawer is being swiped. */
	nestedDrawerSwiping: boolean;
	/** The direction a swipe dismisses the drawer in. */
	swipeDirection: DrawerSwipeDirection;
	/** Whether the drawer is being swiped. */
	swiping: boolean;
}

export interface DrawerPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Element to focus when the drawer opens. Defaults to the popup itself.
	 * Pass an element or a function. There is no ref object.
	 */
	initialFocus?: DialogFocusTarget;
	/**
	 * Element to focus when the drawer closes.
	 * Pass an element or a function. There is no ref object.
	 */
	finalFocus?: DialogFocusTarget;
	render?: PartRender<HTMLDivElement, DrawerPopupState>;
	children?: Snippet;
}

export interface DrawerBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface DrawerBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Render the backdrop even when this drawer is nested.
	 * @default false
	 */
	forceRender?: boolean;
	render?: PartRender<HTMLDivElement, DrawerBackdropState>;
	children?: Snippet;
}

export interface DrawerViewportState {
	/** Whether the drawer is open. */
	open: boolean;
	/** Open/close motion phase. */
	transitionStatus: TransitionStatusValue;
	/** Whether the drawer is nested in another drawer. */
	nested: boolean;
	/** Whether a nested drawer is open. */
	nestedDialogOpen: boolean;
}

export interface DrawerViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, DrawerViewportState>;
	children?: Snippet;
}

export interface DrawerSwipeAreaState {
	/** Whether the drawer is open. */
	open: boolean;
	/** Whether the swipe area is being swiped. */
	swiping: boolean;
	/** The direction a swipe opens the drawer in. */
	swipeDirection: DrawerSwipeDirection;
	/** Whether the swipe area is disabled. */
	disabled: boolean;
}

export interface DrawerSwipeAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Ignore swipes.
	 * @default false
	 */
	disabled?: boolean | null;
	/** The direction a swipe opens the drawer in. Defaults to the opposite of the root's `swipeDirection`. */
	swipeDirection?: DrawerSwipeDirection;
	render?: PartRender<HTMLDivElement, DrawerSwipeAreaState>;
	children?: Snippet;
}

export type DrawerContentState = Record<string, never>;

export interface DrawerContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, DrawerContentState>;
	children?: Snippet;
}

export interface DrawerIndentState {
	/** Whether any drawer in the nearest `Drawer.Provider` is open. */
	active: boolean;
}

export interface DrawerIndentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, DrawerIndentState>;
	children?: Snippet;
}

export type DrawerIndentBackgroundState = DrawerIndentState;

export interface DrawerIndentBackgroundProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	render?: PartRender<HTMLDivElement, DrawerIndentBackgroundState>;
	children?: Snippet;
}

export type DrawerProviderState = Record<string, never>;

export interface DrawerProviderProps {
	children?: Snippet;
}

export type DrawerVirtualKeyboardProviderState = Record<string, never>;

export interface DrawerVirtualKeyboardProviderProps {
	children?: Snippet;
}
