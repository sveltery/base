import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

/** Indicator motion phase. `undefined` is the settled phase. */
export type CheckboxIndicatorPhase = 'starting' | 'ending' | 'idle' | undefined;

export interface CheckboxRootState extends FieldRootState {
	/** Whether the checkbox is currently ticked. */
	checked: boolean;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the user should be unable to tick or untick the checkbox. */
	readOnly: boolean;
	/** Whether the user must tick the checkbox before submitting a form. */
	required: boolean;
	/**
	 * Whether the checkbox is in a mixed state.
	 * While mixed, `aria-checked` is `mixed` and the checked style hooks are omitted.
	 */
	indeterminate: boolean;
}

export interface CheckboxIndicatorState extends CheckboxRootState {
	/** Indicator motion phase. */
	transitionStatus: CheckboxIndicatorPhase;
}

/** Props for the box a `render` snippet draws. Spread them onto the element, with the children inside. */
export type CheckboxBoxProps = HTMLAttributes<HTMLElement>;

/**
 * Native input attributes Checkbox.Root takes. They go to the `<input type="checkbox">` that
 * submits. `class` and `style` go to the box, and `host` sends anything else there.
 */
type CheckboxInputAttributes = Omit<
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

export interface CheckboxRootProps extends CheckboxInputAttributes {
	/** A checkbox input. A remote form spread of another input kind is a type error. */
	type?: 'checkbox';
	/**
	 * Whether the checkbox is currently ticked.
	 *
	 * To render an uncontrolled checkbox, use the `defaultChecked` prop instead.
	 * @default false
	 */
	checked?: boolean;
	/**
	 * Whether the checkbox is initially ticked.
	 *
	 * To render a controlled checkbox, use `bind:checked` instead.
	 * @default false
	 */
	defaultChecked?: boolean;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Whether the user should be unable to tick or untick the checkbox.
	 * @default false
	 */
	readonly?: boolean | null;
	/**
	 * Whether the user must tick the checkbox before submitting a form.
	 * @default false
	 */
	required?: boolean | null;
	/**
	 * Whether the checkbox is in a mixed state: neither ticked, nor unticked.
	 * @default false
	 */
	indeterminate?: boolean;
	/**
	 * Whether the checkbox controls a group of child checkboxes.
	 *
	 * Must be used in a [Checkbox Group](https://base.sveltery.dev/components/checkbox-group).
	 * @default false
	 */
	parent?: boolean;
	/** Identifies the field when a form is submitted. */
	name?: string | null;
	/**
	 * The checkbox's value. Identifies it within a [Checkbox Group](https://base.sveltery.dev/components/checkbox-group), falling back to `name` when omitted.
	 * When submitting a form, a checked box submits `value`; with no `value`, it submits the native "on".
	 */
	value?: string;
	/**
	 * The value submitted with the form when the checkbox is unchecked.
	 * By default, unchecked checkboxes do not submit any value, matching native checkbox behavior.
	 */
	uncheckedValue?: string;
	/**
	 * Identifies the form that owns the input.
	 * Useful when the checkbox is rendered outside the form.
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
	render?: Snippet<[props: CheckboxBoxProps, state: CheckboxRootState, children: RenderChildren]>;
	children?: Snippet;
}

export interface CheckboxIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Whether to keep the element in the DOM when the checkbox is not checked.
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
		[
			props: HTMLAttributes<HTMLSpanElement>,
			state: CheckboxIndicatorState,
			children: RenderChildren
		]
	>;
	children?: Snippet;
}
