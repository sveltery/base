import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { PartRender } from '../internal/render-children.js';

/** Upstream meter part state is an empty object: these parts do not project state attributes. */
export type MeterRootState = Record<string, never>;

export type MeterTrackState = MeterRootState;

export type MeterIndicatorState = MeterRootState;

export type MeterValueState = MeterRootState;

export type MeterLabelState = MeterRootState;

export interface MeterRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Options to format the value.
	 * When omitted, the value is formatted as a percentage of the range.
	 */
	format?: Intl.NumberFormatOptions | undefined;
	/**
	 * Returns the human-readable text for `aria-valuenow`.
	 * Receives the formatted clamped value and the raw `value` prop.
	 */
	getAriaValueText?: ((formattedValue: string, value: number) => string) | undefined;
	/**
	 * The locale used by `Intl.NumberFormat` when formatting the value.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument | undefined;
	/**
	 * The maximum value.
	 * @default 100
	 */
	max?: number | undefined;
	/**
	 * The minimum value.
	 * @default 0
	 */
	min?: number | undefined;
	/** The current value. */
	value: number;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, MeterRootState>;
	children?: Snippet;
}

export interface MeterTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, MeterTrackState>;
	children?: Snippet;
}

export interface MeterIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, MeterIndicatorState>;
	children?: Snippet;
}

export interface MeterValueProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Custom value text. Receives the formatted clamped value and the raw `value`.
	 * Omit it to render the formatted value.
	 */
	children?: Snippet<[formattedValue: string, value: number]>;
	/** Replace the default `<span>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLSpanElement, MeterValueState>;
}

export interface MeterLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Replace the default `<span>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLSpanElement, MeterLabelState>;
	children?: Snippet;
}
