import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

/**
 * The progress bar's completion status.
 * `indeterminate` while `value` is `null` or not finite.
 */
export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete';

export interface ProgressState {
	/** The current status. */
	status: ProgressStatus;
}

type DivAttrs = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
type SpanAttrs = Omit<HTMLAttributes<HTMLSpanElement>, 'children'>;

export interface ProgressRootProps extends DivAttrs {
	/** The current value. The component is indeterminate when value is `null`. */
	value: number | null;
	/**
	 * A string value that provides a user-friendly name for `aria-valuenow`, the current value of the progress bar.
	 */
	'aria-valuetext'?: string;
	/**
	 * The maximum value.
	 * @default 100
	 */
	max?: number;
	/**
	 * The minimum value.
	 * @default 0
	 */
	min?: number;
	/** Options to format the value. */
	format?: Intl.NumberFormatOptions;
	/**
	 * The locale used by `Intl.NumberFormat` when formatting the value.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument;
	/**
	 * Accepts a function which returns a string value that provides a human-readable
	 * text alternative for the current value of the progress bar.
	 */
	getAriaValueText?: (formattedValue: string, value: number | null) => string;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: ProgressState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ProgressTrackProps extends DivAttrs {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: ProgressState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ProgressIndicatorProps extends DivAttrs {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: ProgressState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ProgressLabelProps extends SpanAttrs {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: ProgressState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ProgressValueProps extends SpanAttrs {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: ProgressState, children: RenderChildren]
	>;
	/**
	 * Custom value text. Receives the formatted value (`'indeterminate'` while
	 * indeterminate) and the raw value.
	 */
	children?: Snippet<[formattedValue: string | null, value: number | null]>;
}
