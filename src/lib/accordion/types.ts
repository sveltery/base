import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { TransitionStatus } from '../collapsible/types.js';
import type { RenderChildren } from '../internal/render-children.js';

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
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface AccordionRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The value of the item(s) that should be expanded.
	 *
	 * To render an uncontrolled accordion, use the `defaultValue` prop instead.
	 * @default []
	 */
	value?: unknown[];
	/**
	 * The uncontrolled value of the item(s) that should be initially expanded.
	 *
	 * To render a controlled accordion, use `bind:value` instead.
	 */
	defaultValue?: unknown[];
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * Allows the browser's built-in page search to find and expand the panel contents.
	 *
	 * Overrides the `keepMounted` prop and uses `hidden="until-found"`
	 * to hide the element without removing it from the DOM.
	 * @default false
	 */
	hiddenUntilFound?: boolean;
	/**
	 * Whether to keep the element in the DOM while the panel is closed.
	 * This prop is ignored when `hiddenUntilFound` is used.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Deprecated following the [APG guidance update](https://github.com/w3c/aria-practices/pull/3434)
	 * to remove roving focus.
	 *
	 * This prop no longer affects keyboard focus behavior.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Event handler called when an accordion item is expanded or collapsed.
	 * Provides the new value as an argument.
	 */
	onValueChange?: (value: unknown[], eventDetails: AccordionRootChangeEventDetails) => void;
	/**
	 * Whether multiple items can be open at the same time.
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Deprecated following the [APG guidance update](https://github.com/w3c/aria-practices/pull/3434)
	 * to remove roving focus.
	 *
	 * This prop no longer affects keyboard focus behavior.
	 * @default 'vertical'
	 */
	orientation?: AccordionOrientation;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, AccordionRootState>;
	children?: Snippet;
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * A unique value that identifies this accordion item.
	 * If no value is provided, a unique ID will be generated automatically.
	 * Use when controlling the accordion programmatically, or to set an initial
	 * open state.
	 */
	value?: unknown;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean | null;
	/** Event handler called when the panel is opened or closed. */
	onOpenChange?: (open: boolean, eventDetails: AccordionItemChangeEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, AccordionItemState>;
	children?: Snippet;
}

export interface AccordionHeaderProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
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
	disabled?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs before the trigger's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	onmousedown?: HTMLAttributes<HTMLElement>['onmousedown'];
	onpointerdown?: HTMLAttributes<HTMLElement>['onpointerdown'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
	onkeyup?: HTMLAttributes<HTMLElement>['onkeyup'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: AccordionTriggerHostProps, state: AccordionTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface AccordionPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows the browser's built-in page search to find and expand the panel contents.
	 *
	 * Overrides the `keepMounted` prop and uses `hidden="until-found"`
	 * to hide the element without removing it from the DOM.
	 */
	hiddenUntilFound?: boolean;
	/**
	 * Whether to keep the element in the DOM while the panel is closed.
	 * This prop is ignored when `hiddenUntilFound` is used.
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, AccordionPanelState>;
	children?: Snippet;
}
