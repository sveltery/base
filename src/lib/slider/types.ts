// Derived from Base UI v1.8.0 packages/react/src/slider (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type { RenderSnippet } from '../internal/render-children.js';

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderThumbAlignment = 'center' | 'edge' | 'edge-client-only';
export type SliderThumbCollisionBehavior = 'push' | 'swap' | 'none';

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

/**
 * Native input attributes that Slider parts send to the `<input type="range">` of each thumb.
 * The parts own the value, the range and the thumb's ARIA.
 */
type SliderInputAttributes = Omit<
	HTMLInputAttributes,
	| 'type'
	| 'value'
	| 'defaultValue'
	| 'defaultvalue'
	| 'bind:value'
	| 'children'
	| 'class'
	| 'style'
	| 'id'
	| 'name'
	| 'form'
	| 'min'
	| 'max'
	| 'step'
	| 'disabled'
	| 'required'
>;

export interface SliderRootProps extends Omit<SliderInputAttributes, 'aria-labelledby'> {
	/** Range inputs. A remote form spread of another input kind is a type error. */
	type?: 'range';
	/**
	 * The uncontrolled value of the slider when it's initially rendered.
	 * A string, as a remote form spread carries, is read as a number.
	 *
	 * To render a controlled slider, use `bind:value` instead.
	 */
	defaultValue?: SliderValue | string;
	/** Whether the slider should ignore user interaction. @default false */
	disabled?: boolean | null;
	/** Whether a form needs a value for the slider. Sent to every thumb input. @default false */
	required?: boolean | null;
	/** The id of the root element. */
	id?: string | null;
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
	/** Identifies the field when a form is submitted. Every thumb input submits under it. */
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
	 * A string, as a remote form spread carries, is read as a number.
	 */
	value?: SliderValue | string;
	/** Identifies the label of the slider. */
	'aria-labelledby'?: string | null;
	/** Classes for the root element. */
	class?: HTMLAttributes<HTMLDivElement>['class'];
	/** Styles for the root element. */
	style?: HTMLAttributes<HTMLDivElement>['style'];
	/** Attributes for the root element, such as `data-*` attributes or handlers that belong on it. */
	host?: HTMLAttributes<HTMLDivElement>;
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

export interface SliderThumbProps extends SliderInputAttributes {
	/** A range input. A remote form spread of another input kind is a type error. */
	type?: 'range';
	/**
	 * This thumb's value, as a remote form spread carries it. A string is read as a number.
	 * When it changes, the thumb moves to it.
	 */
	value?: number | string;
	/** The value this thumb returns to when its form resets. */
	defaultValue?: number | string;
	/** Identifies this thumb's input when a form is submitted. Defaults to the root's `name`. */
	name?: string | null;
	/** Identifies the form that owns this thumb's input. Defaults to the root's `form`. */
	form?: string | null;
	/** Whether the thumb should ignore user interaction. @default false */
	disabled?: boolean | null;
	/** The id of the thumb element. */
	id?: string | null;
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
	 * `value` or `defaultValue` array. Without it, thumbs count in the order they render.
	 */
	index?: number;
	/** Classes for the thumb element. */
	class?: HTMLAttributes<HTMLDivElement>['class'];
	/** Styles for the thumb element. */
	style?: HTMLAttributes<HTMLDivElement>['style'];
	/** Attributes for the thumb element, such as `data-*` attributes or handlers that belong on it. */
	host?: HTMLAttributes<HTMLDivElement>;
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
