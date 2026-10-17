// Derived from Base UI v1.8.0 packages/react/src/slider (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, BaseUIGenericEventDetails, REASONS } from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { RenderSnippet } from '../internal/render-children.js';

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

export interface SliderRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The uncontrolled value of the slider when it's initially rendered.
	 *
	 * To render a controlled slider, use `bind:value` instead.
	 */
	defaultValue?: SliderValue;
	/** Whether the slider should ignore user interaction. @default false */
	disabled?: boolean | null;
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
	name?: string | null;
	/**
	 * Identifies the form that owns the slider inputs.
	 * Useful when the slider is rendered outside the form.
	 */
	form?: string | null;
	/** The component orientation. @default 'horizontal' */
	orientation?: SliderOrientation;
	/**
	 * The granularity with which the slider can step through values. (A "discrete" slider.)
	 * The `min` prop serves as the origin for the valid values.
	 * We recommend (max - min) to be evenly divisible by the step.
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
	 * How the thumb(s) are aligned relative to `Slider.Control` when the value is at `min` or `max`:
	 * - `center`: The center of the thumb is aligned with the control edge
	 * - `edge`: The thumb is inset within the control such that its edge is aligned with the control edge
	 * - `edge-client-only`: Same as `edge` but renders after Svelte hydration on the client, reducing bundle size in return
	 * @default 'center'
	 */
	thumbAlignment?: SliderThumbAlignment;
	/**
	 * Controls how thumbs behave when they collide during pointer interactions.
	 *
	 * - `'push'` (default): Thumbs push each other without restoring their previous positions when dragged back.
	 * - `'swap'`: Thumbs swap places when dragged past each other.
	 * - `'none'`: Thumbs cannot move past each other; excess movement is ignored.
	 * @default 'push'
	 */
	thumbCollisionBehavior?: SliderThumbCollisionBehavior;
	/**
	 * The value of the slider.
	 * For range sliders, provide an array with one value per thumb.
	 */
	value?: SliderValue;
	/**
	 * Callback function that is fired when the slider's value changed.
	 * Receives the new value as the first argument; the originating event is
	 * available as `eventDetails.event`. The value is also reflected on
	 * `eventDetails.event.target.value` for form integration.
	 *
	 * The `eventDetails.reason` indicates what triggered the change:
	 *
	 * - `'input-change'` when the hidden range input emits a change event (for example, via form integration)
	 * - `'track-press'` when the control track is pressed
	 * - `'drag'` while dragging a thumb
	 * - `'keyboard'` for keyboard input
	 * - `'none'` when the change is triggered without a specific interaction
	 */
	onValueChange?: (value: SliderValue, eventDetails: SliderChangeEventDetails) => void;
	/**
	 * Callback function that is fired when a value change is committed.
	 * Does not fire if the value did not change, or if the change was canceled.
	 * **Warning**: This is a generic event, not a change event.
	 *
	 * The `eventDetails.reason` indicates what triggered the commit:
	 *
	 * - `'drag'` while dragging a thumb
	 * - `'track-press'` when the control track is pressed
	 * - `'keyboard'` for keyboard input
	 * - `'input-change'` when the hidden range input emits a change event (for example, via form integration)
	 * - `'none'` when the commit occurs without a specific interaction
	 */
	onValueCommitted?: (value: SliderValue, eventDetails: SliderCommitEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SliderRootState>;
	children?: Snippet;
}

export interface SliderControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SliderRootState>;
	children?: Snippet;
}

export interface SliderTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SliderRootState>;
	children?: Snippet;
}

export interface SliderIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SliderRootState>;
	children?: Snippet;
}

export interface SliderLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SliderRootState>;
	children?: Snippet;
}

export interface SliderThumbProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'onblur' | 'onfocus' | 'onkeydown'
> {
	/** Whether the thumb should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * A string value forwarded to the [`aria-valuetext`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext) attribute of the `input`.
	 * Ignored when `getAriaValueText` is provided.
	 */
	'aria-valuetext'?: string | undefined;
	/**
	 * A function which returns a string value for the [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) attribute of the `input`.
	 */
	getAriaLabel?: ((index: number) => string) | null;
	/**
	 * A function which returns a string value for the [`aria-valuetext`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext) attribute of the `input`.
	 * This is important for screen reader users.
	 */
	getAriaValueText?: ((formattedValue: string, value: number, index: number) => string) | null;
	/**
	 * The index of the thumb which corresponds to the index of its value in the
	 * `value` or `defaultValue` array.
	 * This prop is required to support server-side rendering for range sliders
	 * with multiple thumbs.
	 */
	index?: number;
	/** A blur handler forwarded to the `input`. */
	onblur?: (event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	/** A focus handler forwarded to the `input`. */
	onfocus?: (event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	/** A keydown handler forwarded to the `input`. */
	onkeydown?: (event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, SliderRootState>;
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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLOutputElement, SliderRootState>;
}
