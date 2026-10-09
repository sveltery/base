// Derived from Base UI v1.8.0 packages/react/src/slider (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	BaseUIChangeEventDetails,
	BaseUIGenericEventDetails,
	REASONS
} from '../internal/event-details.js';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderThumbAlignment = 'center' | 'edge' | 'edge-client-only';
export type SliderThumbCollisionBehavior = 'push' | 'swap' | 'none';

export type SliderChangeEventReason =
	| typeof REASONS.inputChange
	| typeof REASONS.trackPress
	| typeof REASONS.drag
	| typeof REASONS.keyboard
	| typeof REASONS.none;

export type SliderCommitEventReason = SliderChangeEventReason;

export interface SliderChangeEventCustomProperties {
	/** The index of the active thumb at the time of the change. */
	activeThumbIndex: number;
}

export type SliderChangeEventDetails = BaseUIChangeEventDetails<SliderChangeEventReason> &
	SliderChangeEventCustomProperties;

export type SliderCommitEventDetails = BaseUIGenericEventDetails<SliderCommitEventReason>;

export type SliderValue = number | readonly number[];

export interface SliderRootState extends FieldRootState {
	/** The index of the active thumb. */
	activeThumbIndex: number;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the thumb is currently being dragged. */
	dragging: boolean;
	/** The maximum value. */
	max: number;
	/** The minimum value. */
	min: number;
	/** The minimum steps between values in a range slider. @default 0 */
	minStepsBetweenValues: number;
	/** The component orientation. */
	orientation: SliderOrientation;
	/**
	 * The step increment of the slider when incrementing or decrementing. It will snap
	 * to multiples of this value. Decimal values are supported.
	 * @default 1
	 */
	step: number;
	/** The raw number value of the slider. */
	values: readonly number[];
}

type RenderSnippet<Element extends HTMLElement> = Snippet<
	[props: HTMLAttributes<Element>, state: SliderRootState, children: RenderChildren]
>;

export interface SliderRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The uncontrolled value of the slider when it's initially rendered. */
	defaultValue?: SliderValue;
	/** Whether the slider should ignore user interaction. @default false */
	disabled?: boolean;
	/** Options to format the value. */
	format?: Intl.NumberFormatOptions;
	/**
	 * The locale used by `Intl.NumberFormat` when formatting the value.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument;
	/** The maximum allowed value of the slider. Should not be equal to min. @default 100 */
	max?: number;
	/** The minimum allowed value of the slider. Should not be equal to max. @default 0 */
	min?: number;
	/** The minimum steps between values in a range slider. @default 0 */
	minStepsBetweenValues?: number;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/** Identifies the form that owns the slider inputs. */
	form?: string;
	/** The component orientation. @default 'horizontal' */
	orientation?: SliderOrientation;
	/**
	 * The granularity with which the slider can step through values.
	 * The `min` prop serves as the origin for the valid values.
	 * @default 1
	 */
	step?: number;
	/**
	 * The granularity with which the slider can step through values when using
	 * Page Up/Page Down or Shift + Arrow Up/Arrow Down.
	 * @default 10
	 */
	largeStep?: number;
	/**
	 * How the thumb(s) are aligned relative to `Slider.Control` when the value is at `min` or `max`.
	 * `edge-client-only` matches `edge` after the client measures the thumb.
	 * @default 'center'
	 */
	thumbAlignment?: SliderThumbAlignment;
	/**
	 * How thumbs behave when they collide during pointer interactions.
	 * @default 'push'
	 */
	thumbCollisionBehavior?: SliderThumbCollisionBehavior;
	/**
	 * The value of the slider. For range sliders, provide an array with one value per thumb.
	 * `bind:value` shares it with the parent.
	 */
	value?: SliderValue;
	onValueChange?: (value: SliderValue, eventDetails: SliderChangeEventDetails) => void;
	onValueCommitted?: (value: SliderValue, eventDetails: SliderCommitEventDetails) => void;
	render?: RenderSnippet<HTMLDivElement>;
	children?: Snippet;
}

export interface SliderControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: RenderSnippet<HTMLDivElement>;
	children?: Snippet;
}

export interface SliderTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: RenderSnippet<HTMLDivElement>;
	children?: Snippet;
}

export interface SliderIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: RenderSnippet<HTMLDivElement>;
	children?: Snippet;
}

export interface SliderLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	render?: RenderSnippet<HTMLDivElement>;
	children?: Snippet;
}

export interface SliderThumbProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'onblur' | 'onfocus' | 'onkeydown'
> {
	/** Whether the thumb should ignore user interaction. @default false */
	disabled?: boolean;
	/** Forwarded to the nested input's `aria-valuetext`. Ignored when `getAriaValueText` is set. */
	'aria-valuetext'?: string | undefined;
	/** Returns the `aria-label` of the nested input. */
	getAriaLabel?: ((index: number) => string) | null;
	/** Returns the `aria-valuetext` of the nested input. */
	getAriaValueText?: ((formattedValue: string, value: number, index: number) => string) | null;
	/**
	 * The index of the thumb in `value` or `defaultValue`.
	 * Required for server-rendered range sliders.
	 */
	index?: number;
	/** Blur handler forwarded to the nested input. */
	onblur?: (event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	/** Focus handler forwarded to the nested input. */
	onfocus?: (event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	/** Keydown handler forwarded to the nested input. */
	onkeydown?: (event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	render?: RenderSnippet<HTMLDivElement>;
	children?: Snippet;
}

export interface SliderValueProps extends Omit<HTMLAttributes<HTMLOutputElement>, 'children'> {
	/** @default 'off' */
	'aria-live'?: HTMLAttributes<HTMLOutputElement>['aria-live'];
	/**
	 * Custom value text. Receives the formatted strings and the raw numbers.
	 * Omit it to show the formatted values joined with an en dash.
	 */
	children?: Snippet<[formattedValues: readonly string[], values: readonly number[]]>;
	render?: RenderSnippet<HTMLOutputElement>;
}
