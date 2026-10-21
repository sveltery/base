import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
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

/** Props for the box a `render` snippet draws. Spread them onto the element, with the children inside. */
export type RadioBoxProps = HTMLAttributes<HTMLElement>;

/**
 * Native input attributes Radio.Root takes. They go to the `<input type="radio">` that
 * submits. `class` and `style` go to the box, and `host` sends anything else there.
 */
type RadioInputAttributes = Omit<
	HTMLInputAttributes,
	| 'type'
	| 'checked'
	| 'defaultChecked'
	| 'value'
	| 'children'
	| 'class'
	| 'style'
	| 'readonly'
	| 'disabled'
	| 'required'
	| 'name'
	| 'id'
	| 'form'
>;

export interface RadioRootProps extends RadioInputAttributes {
	/** A radio input. A remote form spread of another input kind is a type error. */
	type?: 'radio';
	/**
	 * The unique identifying value of the radio in a group.
	 * The input submits it, serialized to a string when it is not one.
	 */
	value?: unknown;
	/**
	 * Whether a radio outside a group is selected. In a group, `true` selects this radio's
	 * value when it mounts, as a remote form spread does.
	 *
	 * To render an uncontrolled radio, use the `defaultChecked` prop instead.
	 */
	checked?: boolean;
	/**
	 * Whether a radio outside a group is initially selected.
	 *
	 * To render a controlled radio, use `bind:checked` instead.
	 * @default false
	 */
	defaultChecked?: boolean;
	/**
	 * Identifies the field when a form is submitted.
	 * In a group, it replaces the group's name for this radio.
	 */
	name?: string | null;
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
	 * Identifies the form that owns the input.
	 * Useful when the radio is rendered outside the form.
	 */
	form?: string | null;
	/** The id of the input element. */
	id?: string | null;
	/** Classes for the box. */
	class?: HTMLAttributes<HTMLElement>['class'];
	/** Styles for the box. */
	style?: HTMLAttributes<HTMLElement>['style'];
	/** Attributes for the box, such as `data-*` attributes or handlers that belong on it. */
	host?: HTMLAttributes<HTMLElement>;
	/**
	 * Allows you to replace the box's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render, which include the input.
	 */
	render?: Snippet<[props: RadioBoxProps, state: RadioRootState, children: RenderChildren]>;
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
