import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { RenderChildren } from '../internal/render-children.js';

/** Indicator motion phase. `undefined` is the settled phase. */
export type RadioIndicatorPhase = 'starting' | 'ending' | undefined;

export interface RadioRootState {
	/** Whether the radio button is currently selected. */
	checked: boolean;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the user should be unable to select the radio button. */
	readOnly: boolean;
	/** Whether the user must choose a value before submitting a form. */
	required: boolean;
}

export interface RadioIndicatorState extends RadioRootState {
	/** Indicator motion phase. */
	transitionStatus: RadioIndicatorPhase;
}

export type RadioRootChangeEventReason = typeof REASONS.none;
export type RadioRootChangeEventDetails = BaseUIChangeEventDetails<RadioRootChangeEventReason>;

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * The default host is a `<span>`. A native `<button>` host sets `nativeButton`.
 */
export type RadioHostProps = HTMLAttributes<HTMLElement>;

export interface RadioRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/**
	 * The unique identifying value of the radio.
	 * Without a radio group, the radio is selected only when this is `''`.
	 */
	value: unknown;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean;
	/**
	 * Whether the user should be unable to select the radio button.
	 * @default false
	 */
	readOnly?: boolean;
	/**
	 * Whether the user must choose a value before submitting a form.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `true` and render a `<button>`. The `id` is then applied to that button
	 * instead of the hidden input.
	 * @default false
	 */
	nativeButton?: boolean;
	/**
	 * The id of the hidden input.
	 * When `nativeButton` is true, the id is applied to the root element instead.
	 */
	id?: string;
	/** Runs before the radio's click handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: RadioHostProps, state: RadioRootState, children: RenderChildren]>;
	children?: Snippet;
}

export interface RadioIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Whether to keep the indicator in the DOM when the radio is not selected.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: RadioIndicatorState, children: RenderChildren]
	>;
	children?: Snippet;
}
