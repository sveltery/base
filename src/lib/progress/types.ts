import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

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
	/**
	 * The current value. The component is indeterminate when value is `null`
	 * or any non-finite number.
	 */
	value: number | null;
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
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: ProgressState]>;
	children?: Snippet;
}

export interface ProgressTrackProps extends DivAttrs {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: ProgressState]>;
	children?: Snippet;
}

export interface ProgressIndicatorProps extends DivAttrs {
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: ProgressState]>;
	children?: Snippet;
}

export interface ProgressLabelProps extends SpanAttrs {
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLSpanElement>, state: ProgressState]>;
	children?: Snippet;
}

export interface ProgressValueProps extends SpanAttrs {
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLSpanElement>, state: ProgressState]>;
	/**
	 * Custom value text. Receives the formatted value (`'indeterminate'` while
	 * indeterminate) and the raw value.
	 */
	children?: Snippet<[formattedValue: string | null, value: number | null]>;
}
