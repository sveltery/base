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
	| 'open'
	| 'modal'
	| 'onOpenChangeComplete'
	| 'disablePointerDismissal'
	| 'triggerId'
	| 'handle'
	| 'onOpenChange'
> {
	/**
	 * Whether the drawer is currently open.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Determines if the drawer enters a modal state when open.
	 * - `true`: user interaction is limited to just the drawer: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled.
	 * - `false`: user interaction with the rest of the document is allowed.
	 * - `'trap-focus'`: focus is trapped inside the drawer, but document page scroll is not locked and pointer interactions outside of it remain enabled.
	 * @default true
	 */
	modal?: boolean | 'trap-focus';
	/** Event handler called after any animations complete when the drawer is opened or closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Whether to prevent the drawer from closing on outside presses.
	 * For non-modal drawers, this also prevents the drawer from closing when focus moves outside of it.
	 * @default false
	 */
	disablePointerDismissal?: boolean;
	/**
	 * ID of the trigger that the drawer is associated with.
	 * This is useful in conjunction with `bind:open` to create a controlled drawer.
	 * There's no need to specify this prop when the drawer is uncontrolled (that is, when `open` is not bound).
	 * @default null
	 */
	triggerId?: string | null;
	/** Event handler called when the drawer is opened or closed. */
	onOpenChange?: (open: boolean, eventDetails: DrawerChangeEventDetails) => void;
	/**
	 * A handle to associate the drawer with a trigger.
	 * If specified, allows detached triggers to control the drawer's open state.
	 * Can be created with the Drawer.createHandle() method.
	 */
	handle?: DrawerHandle<Payload>;
	/**
	 * The swipe direction used to dismiss the drawer.
	 * @default 'down'
	 */
	swipeDirection?: DrawerSwipeDirection;
	/**
	 * Snap points used to position the drawer.
	 * Use numbers between 0 and 1 to represent fractions of the viewport height,
	 * numbers greater than 1 as pixel values, or strings in `px`/`rem` units
	 * (for example, `'148px'` or `'30rem'`).
	 */
	snapPoints?: DrawerSnapPoint[];
	/**
	 * Disables velocity-based snap skipping so drag distance determines the next snap point.
	 * @default false
	 */
	snapToSequentialPoints?: boolean;
	/** The currently active snap point. Use `bind:snapPoint` to control the snap point. */
	snapPoint?: DrawerSnapPoint | null;
	/** The initial snap point value when `snapPoint` is not bound. */
	defaultSnapPoint?: DrawerSnapPoint | null;
	/** Callback fired when the snap point changes. */
	onSnapPointChange?: (
		snapPoint: DrawerSnapPoint | null,
		eventDetails: DrawerSnapPointChangeEventDetails
	) => void;
}

export interface DrawerTriggerProps<Payload = unknown> extends Omit<
	DialogTriggerProps<Payload>,
	'handle' | 'payload' | 'id'
> {
	/** A payload to pass to the drawer when it is opened. */
	payload?: Payload;
	/**
	 * ID of the trigger. In addition to being forwarded to the rendered element,
	 * it is also used to specify the active trigger for drawers in controlled mode (with the Drawer.Root `triggerId` prop).
	 */
	id?: string | null;
	/**
	 * A handle to associate the trigger with a drawer.
	 * Can be created with the Drawer.createHandle() method.
	 */
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
	 * Determines the element to focus when the drawer is opened.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (first tabbable element or popup).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
	 */
	initialFocus?: DialogFocusTarget;
	/**
	 * Determines the element to focus when the drawer is closed.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (trigger or previously focused element).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
	 */
	finalFocus?: DialogFocusTarget;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DrawerPopupState>;
	children?: Snippet;
}

export interface DrawerBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
}

export interface DrawerBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the backdrop is forced to render even when nested.
	 * @default false
	 */
	forceRender?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
	 * Whether the swipe area is disabled.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * The swipe direction that opens the drawer.
	 * Defaults to the opposite of `Drawer.Root` `swipeDirection`.
	 */
	swipeDirection?: DrawerSwipeDirection;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DrawerSwipeAreaState>;
	children?: Snippet;
}

export type DrawerContentState = Record<string, never>;

export interface DrawerContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DrawerContentState>;
	children?: Snippet;
}

export interface DrawerIndentState {
	/** Whether any drawer in the nearest `Drawer.Provider` is open. */
	active: boolean;
}

export interface DrawerIndentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DrawerIndentState>;
	children?: Snippet;
}

export type DrawerIndentBackgroundState = DrawerIndentState;

export interface DrawerIndentBackgroundProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
