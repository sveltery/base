import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { TransitionStatus } from '../collapsible/types.js';

export type AccordionOrientation = 'horizontal' | 'vertical';

export interface AccordionRootState {
	/**
	 * Open item values.
	 * Read it from the parent with `bind:value`.
	 */
	value: readonly unknown[];
	/** Whether the accordion should ignore user interaction. */
	disabled: boolean;
	/**
	 * Orientation. It no longer moves focus. It is still exposed as `data-orientation`.
	 */
	orientation: AccordionOrientation;
}

export interface AccordionItemState extends AccordionRootState {
	/** Whether the panel is currently hidden. */
	hidden: boolean;
	/** DOM order of the item. `-1` until the item host is mounted. */
	index: number;
	/** Whether this item is open. */
	open: boolean;
}

export interface AccordionPanelState extends AccordionItemState {
	/** Panel motion phase. Can settle before the item does. */
	transitionStatus: TransitionStatus;
}

export type AccordionHeaderState = AccordionItemState;
export type AccordionTriggerState = AccordionItemState;

export type AccordionRootChangeEventReason = typeof REASONS.triggerPress | typeof REASONS.none;
export type AccordionRootChangeEventDetails =
	BaseUIChangeEventDetails<AccordionRootChangeEventReason>;

export type AccordionItemChangeEventReason = AccordionRootChangeEventReason;
export type AccordionItemChangeEventDetails = AccordionRootChangeEventDetails;

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: Snippet]
>;

export interface AccordionRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Values of the open items.
	 * Use `bind:value` to share the array with the parent.
	 * Omit it to start closed. A one-way `value` sets it until the parent changes it.
	 * @default []
	 */
	value?: unknown[];
	/** Whether the accordion should ignore user interaction. @default false */
	disabled?: boolean;
	/**
	 * Lets page search find a closed panel and open it.
	 * Overrides `keepMounted` and uses `hidden="until-found"`.
	 * @default false
	 */
	hiddenUntilFound?: boolean;
	/**
	 * Whether closed panels stay in the DOM.
	 * Ignored when `hiddenUntilFound` is set.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Deprecated. Arrow keys no longer move focus, so this does nothing.
	 * @default true
	 */
	loopFocus?: boolean;
	/** Called before the open values change. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: unknown[], eventDetails: AccordionRootChangeEventDetails) => void;
	/**
	 * When false, opening one item closes the others.
	 * When true, each item changes on its own.
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Deprecated. It no longer moves focus.
	 * @default 'vertical'
	 */
	orientation?: AccordionOrientation;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, AccordionRootState>;
	children?: Snippet;
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Identifies this item in `value`.
	 * Omitted values get a generated `base-ui-` id.
	 */
	value?: unknown;
	/**
	 * Whether this item should ignore user interaction.
	 * The root `disabled` value also disables it.
	 * @default false
	 */
	disabled?: boolean;
	/** Called before this item opens or closes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: AccordionItemChangeEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, AccordionItemState>;
	children?: Snippet;
}

export interface AccordionHeaderProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	/** Replace the default `<h3>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLHeadingElement, AccordionHeaderState>;
	children?: Snippet;
}

export type AccordionTriggerHostProps = HTMLAttributes<HTMLElement>;

export interface AccordionTriggerProps extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'onclick' | 'onmousedown' | 'onpointerdown' | 'onkeydown' | 'onkeyup'
> {
	/**
	 * Whether the trigger should ignore user interaction.
	 * `false` does not re-enable a disabled item or root.
	 */
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs before the trigger's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	onmousedown?: HTMLAttributes<HTMLElement>['onmousedown'];
	onpointerdown?: HTMLAttributes<HTMLElement>['onpointerdown'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
	onkeyup?: HTMLAttributes<HTMLElement>['onkeyup'];
	/** Replace the default `<button>`. Spread `props` onto the host and render `children`. */
	render?: Snippet<
		[props: AccordionTriggerHostProps, state: AccordionTriggerState, children: Snippet]
	>;
	children?: Snippet;
}

export interface AccordionPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows page search to find and expand this panel.
	 * Overrides the root value when set.
	 */
	hiddenUntilFound?: boolean;
	/**
	 * Whether to keep this panel mounted while closed.
	 * Overrides the root value when set. Ignored when hidden-until-found is on.
	 */
	keepMounted?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, AccordionPanelState>;
	children?: Snippet;
}
