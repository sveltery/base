import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { REASONS, ReasonToEvent } from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren, RenderSnippet } from '../internal/render-children.js';

export type Direction = -1 | 1;

export interface NumberFieldRootState extends FieldRootState {
	/** The raw numeric value of the field. */
	value: number | null;
	/** The formatted string presented in the input. */
	inputValue: string;
	/** Whether the user must enter a value before submitting a form. */
	required: boolean;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the user should be unable to change the field value. */
	readOnly: boolean;
	/** Whether the user is currently scrubbing the field. */
	scrubbing: boolean;
}

/**
 * Native input attributes NumberField.Root takes. They go to the hidden `<input type="number">`
 * that submits. `class` and `style` go to the root element, and `host` sends anything else there.
 */
type NumberFieldHiddenInputAttributes = Omit<
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
	| 'required'
	| 'disabled'
	| 'readonly'
>;

export interface NumberFieldRootProps extends NumberFieldHiddenInputAttributes {
	/** A number input. A remote form spread of another input kind is a type error. */
	type?: 'number';
	/** The id of the visible input element. */
	id?: string | null;
	/** The minimum value of the input element. */
	min?: number;
	/** The maximum value of the input element. */
	max?: number;
	/**
	 * When true, direct text entry may be outside the `min`/`max` range without clamping,
	 * so native range underflow/overflow validation can occur.
	 * Step-based interactions (keyboard arrows, buttons, wheel, scrub) still clamp.
	 * @default false
	 */
	allowOutOfRange?: boolean;
	/**
	 * The small step value of the input element when incrementing while the alt key is held.
	 * Snaps to multiples of this value when `snapOnStep` is enabled.
	 * @default 0.1
	 */
	smallStep?: number;
	/**
	 * Amount to increment and decrement with the buttons and arrow keys, or to scrub with pointer movement in the scrub area.
	 * To always enable step validation on form submission, specify the `min` prop explicitly in conjunction with this prop.
	 * Specify `step="any"` to always disable step validation; interactive stepping then uses a base amount of `1`, while the alt and shift keys still step by `smallStep` and `largeStep`.
	 * @default 1
	 */
	step?: number | 'any';
	/**
	 * The large step value of the input element when incrementing while the shift key is held.
	 * Snaps to multiples of this value when `snapOnStep` is enabled.
	 * @default 10
	 */
	largeStep?: number;
	/**
	 * Whether the user must enter a value before submitting a form.
	 * The hidden input gets `required` only once the page is interactive, because typing
	 * reaches it only through JavaScript.
	 * @default false
	 */
	required?: boolean | null;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Whether the user should be unable to change the field value.
	 * The visible input carries it as `aria-readonly`, so it stays in constraint validation.
	 * @default false
	 */
	readonly?: boolean | null;
	/** Identifies the field when a form is submitted. */
	name?: string | null;
	/**
	 * Identifies the form that owns the hidden input.
	 * Useful when the number field is rendered outside the form.
	 */
	form?: string | null;
	/**
	 * The raw numeric value of the field.
	 * A string, as a remote form spread carries, is read as a number, and `''` as no value.
	 */
	value?: number | string | null;
	/**
	 * The uncontrolled value of the field when it's initially rendered.
	 *
	 * To render a controlled number field, use `bind:value` instead.
	 */
	defaultValue?: number | string | null;
	/**
	 * Whether to allow the user to scrub the input value with the mouse wheel while focused and
	 * hovering over the input.
	 * @default false
	 */
	allowWheelScrub?: boolean;
	/**
	 * Whether the value should snap to the nearest step when incrementing or decrementing.
	 * @default false
	 */
	snapOnStep?: boolean;
	/** Options to format the input value. */
	format?: Intl.NumberFormatOptions;
	/**
	 * The locale of the input element.
	 * Defaults to the user's runtime locale.
	 */
	locale?: Intl.LocalesArgument;
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
	render?: RenderSnippet<HTMLDivElement, NumberFieldRootState>;
	children?: Snippet;
}

export type NumberFieldGroupState = NumberFieldRootState;

export interface NumberFieldGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLDivElement, NumberFieldGroupState>;
	children?: Snippet;
}

export type NumberFieldInputState = NumberFieldRootState;

export interface NumberFieldInputProps extends Omit<
	HTMLInputAttributes,
	'children' | 'value' | 'defaultValue'
> {
	/**
	 * A user-friendly description of the input's role for assistive tech. This is a role
	 * description, not an accessible name — use `Field.Label` or `aria-label` to name the control.
	 * @default 'Number field'
	 */
	'aria-roledescription'?: HTMLInputAttributes['aria-roledescription'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: NumberFieldInputState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type NumberFieldStepperState = NumberFieldRootState;

export interface NumberFieldStepperProps extends Omit<HTMLButtonAttributes, 'children'> {
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLButtonElement, NumberFieldStepperState>;
	children?: Snippet;
}

export type NumberFieldScrubAreaState = NumberFieldRootState;

export interface NumberFieldScrubAreaProps extends Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children'
> {
	/**
	 * Cursor movement direction in the scrub area.
	 * @default 'horizontal'
	 */
	direction?: 'horizontal' | 'vertical';
	/**
	 * Determines how many pixels the cursor must move before the value changes.
	 * A higher value will make scrubbing less sensitive.
	 * @default 2
	 */
	pixelSensitivity?: number;
	/**
	 * If specified, determines the distance that the cursor may move from the center
	 * of the scrub area before it will loop back around.
	 */
	teleportDistance?: number;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, NumberFieldScrubAreaState>;
	children?: Snippet;
}

export type NumberFieldScrubAreaCursorState = NumberFieldRootState;

export interface NumberFieldScrubAreaCursorProps extends Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RenderSnippet<HTMLSpanElement, NumberFieldScrubAreaCursorState>;
	children?: Snippet;
}

export interface EventWithOptionalKeyState {
	altKey?: boolean;
	shiftKey?: boolean;
}

type DirectionalChangeReason =
	| typeof REASONS.incrementPress
	| typeof REASONS.decrementPress
	| typeof REASONS.wheel
	| typeof REASONS.scrub
	| typeof REASONS.keyboard;

export interface IncrementValueParameters {
	direction: Direction;
	event?: ReasonToEvent<DirectionalChangeReason>;
	reason: DirectionalChangeReason;
	currentValue?: number | null;
}
