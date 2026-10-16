import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

/** Upstream meter part state is an empty object: these parts do not project state attributes. */
export type MeterRootState = Record<string, never>;

export type MeterTrackState = MeterRootState;

export type MeterIndicatorState = MeterRootState;

export type MeterValueState = MeterRootState;

export type MeterLabelState = MeterRootState;

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: RenderChildren]
>;

export interface MeterRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Options to format the value. */
	format?: Intl.NumberFormatOptions | undefined;
	/**
	 * A function that returns a string value that provides a human-readable text alternative for `aria-valuenow`, the current value of the meter.
	 */
	getAriaValueText?: ((formattedValue: string, value: number) => string) | undefined;
	/**
	 * The locale used by `Intl.NumberFormat` when formatting the value.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument | undefined;
	/**
	 * The maximum value
	 * @default 100
	 */
	max?: number | undefined;
	/**
	 * The minimum value
	 * @default 0
	 */
	min?: number | undefined;
	/** The current value. */
	value: number;
	/**
	 * A string value that provides a user-friendly name for `aria-valuenow`, the current value of the meter.
	 */
	'aria-valuetext'?: string;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, MeterRootState>;
	children?: Snippet;
}

export interface MeterTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, MeterTrackState>;
	children?: Snippet;
}

export interface MeterIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, MeterIndicatorState>;
	children?: Snippet;
}

export interface MeterValueProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Custom value text. Receives the formatted clamped value and the raw `value`.
	 * Omit it to render the formatted value.
	 */
	children?: Snippet<[formattedValue: string, value: number]>;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLSpanElement, MeterValueState>;
}

export interface MeterLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLSpanElement, MeterLabelState>;
	children?: Snippet;
}
