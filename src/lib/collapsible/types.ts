import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

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
	[props: HTMLAttributes<Element>, state: State, children: Snippet]
>;

export interface CollapsibleRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the panel is open.
	 * Use `bind:open` to share it with the parent.
	 * Omit it to start from `defaultOpen`.
	 */
	open?: boolean;
	/**
	 * The open state when `open` is omitted, and when a controlled `open` is cleared.
	 * @default false
	 */
	defaultOpen?: boolean;
	/** Whether the collapsible should ignore user interaction. @default false */
	disabled?: boolean;
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
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
		[props: CollapsibleTriggerHostProps, state: CollapsibleTriggerState, children: Snippet]
	>;
	children?: Snippet;
}

export interface CollapsiblePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows the browser's page search to find and expand the panel.
	 * Overrides `keepMounted` and uses `hidden="until-found"`.
	 * @default false
	 */
	hiddenUntilFound?: boolean;
	/**
	 * Whether to keep the panel in the DOM while it is closed.
	 * Ignored when `hiddenUntilFound` is set.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, CollapsiblePanelState>;
	children?: Snippet;
}
