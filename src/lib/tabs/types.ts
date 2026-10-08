import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { TransitionStatus } from '../collapsible/types.js';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none';

/** A tab value. `null` selects nothing. */
export type TabsValue = unknown;

export interface TabsTabPosition {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface TabsTabSize {
	width: number;
	height: number;
}

export interface TabsRootState {
	/** Layout direction. Exposed as `data-orientation`. */
	orientation: TabsOrientation;
	/** Where the active tab sits relative to the previous one. */
	tabActivationDirection: TabsActivationDirection;
}

export type TabsListState = TabsRootState;

export interface TabsTabState extends TabsRootState {
	/** Whether this tab ignores activation. */
	disabled: boolean;
	/** Whether this tab's panel is the selected one. */
	active: boolean;
}

export interface TabsPanelState extends TabsRootState {
	/** Whether the panel is currently hidden. */
	hidden: boolean;
	/** Enter and exit motion phase. */
	transitionStatus: TransitionStatus;
}

export interface TabsIndicatorState extends TabsRootState {
	/** Active tab edges inside the list. `null` when nothing is selected. */
	activeTabPosition: TabsTabPosition | null;
	/** Active tab size. `null` when nothing is selected. */
	activeTabSize: TabsTabSize | null;
}

export type TabsRootChangeEventReason =
	typeof REASONS.none | typeof REASONS.disabled | typeof REASONS.missing | typeof REASONS.initial;

export type TabsRootChangeEventDetails = BaseUIChangeEventDetails<TabsRootChangeEventReason> & {
	/**
	 * Where the next tab sits relative to the current one.
	 * Automatic changes use `none`.
	 */
	activationDirection: TabsActivationDirection;
};

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: Snippet]
>;

export interface TabsRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The selected tab value.
	 * Omit it and the root starts at `0`, then moves to the first enabled tab
	 * when that selection is disabled or missing.
	 * Pass it, or `bind:value`, to hold the selection: the root does not move it
	 * when a tab is disabled or removed. A click can still change it until the
	 * parent passes a new value. `null` selects nothing.
	 * @default 0
	 */
	value?: TabsValue | null;
	/**
	 * Value used when `value` is omitted, and when a controlled `value` is cleared.
	 * @default 0
	 */
	defaultValue?: TabsValue | null;
	/**
	 * Layout direction. Arrow keys follow it.
	 * @default 'horizontal'
	 */
	orientation?: TabsOrientation;
	/**
	 * Called when the selected value changes.
	 * `reason` is `none` for a click or keyboard activation, `initial` for the
	 * first automatic selection when `value` is omitted, `disabled` when the
	 * selected tab becomes disabled, and `missing` when it is removed.
	 * `cancel()` stops a `none` change. It does not stop automatic changes.
	 */
	onValueChange?: (value: TabsValue | null, eventDetails: TabsRootChangeEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, TabsRootState>;
	children?: Snippet;
}

export interface TabsListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * When true, arrow keys select the tab they move to.
	 * When false, Enter or Space selects the focused tab.
	 * @default false
	 */
	activateOnFocus?: boolean;
	/**
	 * Whether arrow keys wrap from the last tab to the first.
	 * @default true
	 */
	loopFocus?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, TabsListState>;
	children?: Snippet;
}

export type TabsTabHostProps = HTMLAttributes<HTMLElement>;

export interface TabsTabProps extends Omit<
	HTMLButtonAttributes,
	| 'children'
	| 'disabled'
	| 'value'
	| 'onclick'
	| 'onfocus'
	| 'onpointerdown'
	| 'onkeydown'
	| 'onkeyup'
> {
	/** Identifies this tab in the root `value`. */
	value: TabsValue;
	/**
	 * Whether this tab ignores activation.
	 * A disabled tab stays focusable. Arrow keys can land on it.
	 * When `value` is omitted, a disabled tab is not the initial selection.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs before the tab's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	onfocus?: HTMLAttributes<HTMLElement>['onfocus'];
	onpointerdown?: HTMLAttributes<HTMLElement>['onpointerdown'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
	onkeyup?: HTMLAttributes<HTMLElement>['onkeyup'];
	/** Replace the default `<button>`. Spread `props` onto the host and render `children`. */
	render?: Snippet<[props: TabsTabHostProps, state: TabsTabState, children: Snippet]>;
	children?: Snippet;
}

export interface TabsPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Shown when the tab with the same value is selected. */
	value: TabsValue;
	/**
	 * Whether to keep the panel in the DOM while it is hidden.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, TabsPanelState>;
	children?: Snippet;
}

export interface TabsIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Accepted for API compatibility. The pre-hydration script is not ported.
	 * @default false
	 */
	renderBeforeHydration?: boolean;
	/** Replace the default `<span>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLSpanElement, TabsIndicatorState>;
	children?: Snippet;
}
