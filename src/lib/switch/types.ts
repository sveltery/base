import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export interface SwitchRootState extends FieldRootState {
	/** Whether the switch is currently active. */
	checked: boolean;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the user should be unable to activate or deactivate the switch. */
	readOnly: boolean;
	/** Whether the user must activate the switch before submitting a form. */
	required: boolean;
}

export type SwitchThumbState = SwitchRootState;

/** Props for the box a `render` snippet draws. Spread them onto the element, with the children inside. */
export type SwitchBoxProps = HTMLAttributes<HTMLElement>;

/**
 * Native input attributes Switch.Root takes. They go to the `<input type="checkbox" role="switch">`
 * that submits. `class` and `style` go to the box, and `host` sends anything else there.
 */
type SwitchInputAttributes = Omit<
	HTMLInputAttributes,
	| 'type'
	| 'role'
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

export interface SwitchRootProps extends SwitchInputAttributes {
	/** A checkbox input. A remote form spread of another input kind is a type error. */
	type?: 'checkbox';
	/**
	 * Whether the switch is currently active.
	 *
	 * To render an uncontrolled switch, use the `defaultChecked` prop instead.
	 * @default false
	 */
	checked?: boolean;
	/**
	 * Whether the switch is initially active.
	 *
	 * To render a controlled switch, use `bind:checked` instead.
	 * @default false
	 */
	defaultChecked?: boolean;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Whether the user should be unable to activate or deactivate the switch.
	 * @default false
	 */
	readonly?: boolean | null;
	/**
	 * Whether the user must activate the switch before submitting a form.
	 * @default false
	 */
	required?: boolean | null;
	/** Identifies the field when a form is submitted. */
	name?: string | null;
	/** The value submitted with the form when the switch is on. @default "on" */
	value?: string;
	/**
	 * The value submitted with the form when the switch is off.
	 * By default, an off switch submits no value, matching native checkbox behavior.
	 */
	uncheckedValue?: string;
	/** Identifies the form that owns the input. Useful when the switch is rendered outside the form. */
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
	render?: Snippet<[props: SwitchBoxProps, state: SwitchRootState, children: RenderChildren]>;
	children?: Snippet;
}

export interface SwitchThumbProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: SwitchThumbState, children: RenderChildren]
	>;
	children?: Snippet;
}
