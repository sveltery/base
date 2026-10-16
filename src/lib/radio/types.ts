import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

/** Indicator motion phase. `undefined` is the settled phase. */
export type RadioIndicatorPhase = 'starting' | 'ending' | 'idle' | undefined;

export interface RadioRootState extends FieldRootState {
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
	/** The unique identifying value of the radio in a group. */
	value: unknown;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Whether the user should be unable to select the radio button.
	 * @default false
	 */
	readonly?: boolean | null;
	/**
	 * Whether the user must choose a value before submitting a form.
	 * @default false
	 */
	required?: boolean | null;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `true` if the rendered element is a native button.
	 * @default false
	 */
	nativeButton?: boolean;
	/**
	 * The id of the hidden input.
	 * When `nativeButton` is true, the id is applied to the root element instead.
	 */
	id?: string | null;
	/** Runs before the radio's click handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: RadioHostProps, state: RadioRootState, children: RenderChildren]>;
	children?: Snippet;
}

export interface RadioIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Whether to keep the HTML element in the DOM when the radio button is inactive.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: RadioIndicatorState, children: RenderChildren]
	>;
	children?: Snippet;
}
