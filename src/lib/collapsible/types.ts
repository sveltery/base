import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { RenderChildren } from '../internal/render-children.js';

/** Open/close motion phase. `undefined` is the settled closed phase. */
export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined;

export interface CollapsibleRootState {
	/** Whether the panel is currently open. */
	open: boolean;
	/** Whether the collapsible should ignore user interaction. */
	disabled: boolean;
	/** Shared open/close motion phase. */
	transitionStatus: TransitionStatus;
}

export interface CollapsiblePanelState extends CollapsibleRootState {
	/** Panel motion phase. Can settle to idle before the root does. */
	transitionStatus: TransitionStatus;
}

export type CollapsibleTriggerState = CollapsibleRootState;

export type CollapsibleRootChangeEventReason = typeof REASONS.triggerPress | typeof REASONS.none;
export type CollapsibleRootChangeEventDetails =
	BaseUIChangeEventDetails<CollapsibleRootChangeEventReason>;

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface CollapsibleRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the collapsible panel is currently open.
	 *
	 * To render an uncontrolled collapsible, pass `open` without `bind:`.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean | null;
	/** Event handler called when the panel is opened or closed. */
	onOpenChange?: (open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, CollapsibleRootState>;
	children?: Snippet;
}

/**
 * Props a trigger `render` snippet spreads onto its host.
 * Handlers are typed for a generic element so the same object spreads onto a
 * `<button>` or another element when `nativeButton` is false.
 */
export type CollapsibleTriggerHostProps = HTMLAttributes<HTMLElement>;

export interface CollapsibleTriggerProps extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'onclick' | 'onmousedown' | 'onpointerdown' | 'onkeydown' | 'onkeyup'
> {
	/**
	 * Whether the trigger should ignore user interaction.
	 * Defaults to the root's `disabled` value.
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
		[props: CollapsibleTriggerHostProps, state: CollapsibleTriggerState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface CollapsiblePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows the browser's built-in page search to find and expand the panel contents.
	 *
	 * Overrides the `keepMounted` prop and uses `hidden="until-found"`
	 * to hide the element without removing it from the DOM.
	 * @default false
	 */
	hiddenUntilFound?: boolean;
	/**
	 * Whether to keep the element in the DOM while the panel is hidden.
	 * This prop is ignored when `hiddenUntilFound` is used.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, CollapsiblePanelState>;
	children?: Snippet;
}
