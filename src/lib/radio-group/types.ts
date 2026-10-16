import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
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

export type RadioGroupChangeEventReason = typeof REASONS.none;
export type RadioGroupChangeEventDetails = BaseUIChangeEventDetails<RadioGroupChangeEventReason>;

export interface RadioGroupProps<Value = unknown> extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	/**
	 * The controlled value of the radio item that should be currently selected.
	 *
	 * To render an uncontrolled radio group, use the `defaultValue` prop instead.
	 */
	value?: Value;
	/**
	 * The uncontrolled value of the radio button that should be initially selected.
	 *
	 * To render a controlled radio group, use `bind:value` instead.
	 * @default undefined
	 */
	defaultValue?: Value;
	/**
	 * Whether the component should ignore user interaction.
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
	/** Identifies the field when a form is submitted. */
	name?: string | null;
	/**
	 * Identifies the form that owns the radio inputs.
	 * Useful when the radio group is rendered outside the form.
	 */
	form?: string | null;
	/** Callback fired when the value changes. */
	onValueChange?: (value: Value, eventDetails: RadioGroupChangeEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: RadioGroupState, children: RenderChildren]
	>;
	children?: Snippet;
}
