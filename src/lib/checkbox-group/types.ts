import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export interface CheckboxGroupState extends FieldRootState {
	/** Whether the group should ignore user interaction. */
	disabled: boolean;
}

export interface CheckboxGroupProps extends Omit<HTMLFieldsetAttributes, 'children' | 'name'> {
	/**
	 * The name every child checkbox submits under, as in an HTML checkbox group.
	 * Inside a named Field, the Field's name is used instead.
	 */
	name?: string;
	/**
	 * Names of the checkboxes in the group that should be ticked.
	 *
	 * To render an uncontrolled checkbox group, use the `defaultValue` prop instead.
	 */
	value?: string[];
	/**
	 * Names of the checkboxes in the group that should be initially ticked.
	 *
	 * To render a controlled checkbox group, use `bind:value` instead.
	 * @default []
	 */
	defaultValue?: string[];
	/** Names of all checkboxes in the group. Use this when creating a parent checkbox. */
	allValues?: string[];
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLFieldsetAttributes, state: CheckboxGroupState, children: RenderChildren]
	>;
	children?: Snippet;
}
