import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { TransitionStatus } from '../collapsible/types.js';
import type { RenderChildren, RenderSnippet } from '../internal/render-children.js';

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

export interface TabsRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The value of the currently active `Tab`.
	 * When the value is `null`, no Tab will be active.
	 *
	 * To render uncontrolled tabs, use the `defaultValue` prop instead.
	 * @default 0
	 */
	value?: TabsValue | null;
	/**
	 * The default value. Use when the component is not controlled.
	 * When the value is `null`, no Tab will be active.
	 * @default 0
	 */
	defaultValue?: TabsValue | null;
	/**
	 * The component orientation (layout flow direction).
	 * @default 'horizontal'
	 */
	orientation?: TabsOrientation;
	/**
	 * Callback invoked when new value is being set.
	 *
	 * The event `reason` is `'none'` for user-initiated changes, such as a click
	 * or keyboard navigation; `'initial'` for the first automatic selection or
	 * fallback in uncontrolled roots when `defaultValue` is omitted or
	 * `undefined`, including when the implicit initial value is disabled or
	 * missing; `'disabled'` for automatic fallback when the selected tab becomes
	 * disabled in uncontrolled roots; or `'missing'` for automatic fallback when
	 * the selected tab is removed, or when an explicit `defaultValue` never
	 * matches a mounted tab in uncontrolled roots.
	 *
	 * For automatic changes, the selected value can be `null` when no enabled Tab
	 * is available as a fallback.
	 *
	 * Automatic changes cannot be canceled; calling `eventDetails.cancel()` for
	 * `'initial'`, `'disabled'`, or `'missing'` has no effect.
	 */
	onValueChange?: (value: TabsValue | null, eventDetails: TabsRootChangeEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, TabsRootState>;
	children?: Snippet;
}

export interface TabsListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether to automatically change the active tab on arrow key focus. Otherwise, tabs will be activated using Enter or Space key press.
	 * @default false
	 */
	activateOnFocus?: boolean;
	/**
	 * Whether to loop keyboard focus back to the first item
	 * when the end of the list is reached while using the arrow keys.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, TabsListState>;
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
	/** The value of the Tab. */
	value: TabsValue;
	/**
	 * Whether the Tab is disabled.
	 *
	 * If a first Tab on a `<Tabs.List>` is disabled, it won't initially be selected.
	 * Instead, the next enabled Tab will be selected.
	 * However, it does not work like this during server-side rendering, as it is not known
	 * during pre-rendering which Tabs are disabled.
	 * To work around it, ensure that `defaultValue` or `value` on `<Tabs.Root>` is set to an enabled Tab's value.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs before the tab's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	onfocus?: HTMLAttributes<HTMLElement>['onfocus'];
	onpointerdown?: HTMLAttributes<HTMLElement>['onpointerdown'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
	onkeyup?: HTMLAttributes<HTMLElement>['onkeyup'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: TabsTabHostProps, state: TabsTabState, children: RenderChildren]>;
	children?: Snippet;
}

export interface TabsPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The value of the TabPanel. It will be shown when the Tab with the corresponding value is active.
	 */
	value: TabsValue;
	/**
	 * Whether to keep the HTML element in the DOM while the panel is hidden.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, TabsPanelState>;
	children?: Snippet;
}

export interface TabsIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Whether to render itself before Svelte hydrates.
	 * This minimizes the time that the indicator isn't visible after server-side rendering.
	 * @default false
	 */
	renderBeforeHydration?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, TabsIndicatorState>;
	children?: Snippet;
}
