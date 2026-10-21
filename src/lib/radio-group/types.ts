import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export interface RadioGroupState extends FieldRootState {
	/** Whether the group should ignore user interaction. */
	disabled: boolean;
	/** Whether the user should be unable to select a different radio. */
	readOnly: boolean;
	/** Whether the user must choose a value before submitting a form. */
	required: boolean;
}

export interface RadioGroupProps<Value = unknown> extends Omit<
	HTMLFieldsetAttributes,
	'children' | 'name' | 'form' | 'disabled'
> {
	/**
	 * The value of the radio that should be currently selected.
	 *
	 * To render an uncontrolled radio group, use the `defaultValue` prop instead.
	 */
	value?: Value;
	/**
	 * The value of the radio that should be initially selected.
	 *
	 * To render a controlled radio group, use `bind:value` instead.
	 * @default undefined
	 */
	defaultValue?: Value;
	/**
	 * Whether the component should ignore user interaction.
	 * Disables the `<fieldset>`, and every radio in it, natively.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * Whether the user should be unable to select a different radio button in the group.
	 * @default false
	 */
	readonly?: boolean | null;
	/**
	 * Whether the user must choose a value before submitting a form.
	 * @default false
	 */
	required?: boolean | null;
	/**
	 * The name every radio submits under, as in an HTML radio group.
	 * Inside a named Field, the Field's name is used instead.
	 * Outside a remote form, an unnamed group generates one, so the browser keeps one radio selected.
	 */
	name?: string | null;
	/**
	 * Identifies the form that owns the radio inputs.
	 * Useful when the radio group is rendered outside the form.
	 */
	form?: string | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLFieldsetAttributes, state: RadioGroupState, children: RenderChildren]
	>;
	children?: Snippet;
}
