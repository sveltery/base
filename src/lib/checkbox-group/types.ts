import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { FieldRootState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export interface CheckboxGroupState extends FieldRootState {
	/** Whether the group should ignore user interaction. */
	disabled: boolean;
}

export type CheckboxGroupChangeEventReason = typeof REASONS.none;
export type CheckboxGroupChangeEventDetails =
	BaseUIChangeEventDetails<CheckboxGroupChangeEventReason>;

export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
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
	 * Event handler called when a checkbox in the group is ticked or unticked.
	 * Provides the new value as an argument.
	 */
	onValueChange?: (value: string[], eventDetails: CheckboxGroupChangeEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: CheckboxGroupState, children: RenderChildren]
	>;
	children?: Snippet;
}
