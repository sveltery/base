import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { RenderChildren } from '../internal/render-children.js';

export type ToggleGroupOrientation = 'horizontal' | 'vertical';

export interface ToggleGroupState {
	/** Whether the group should ignore user interaction. */
	disabled: boolean;
	/**
	 * When false, only one toggle in the group can be pressed.
	 * When true, several can be pressed together.
	 */
	multiple: boolean;
	/** The orientation of the toggle group. */
	orientation: ToggleGroupOrientation;
}

export type ToggleGroupChangeEventReason = typeof REASONS.none;
export type ToggleGroupChangeEventDetails = BaseUIChangeEventDetails<ToggleGroupChangeEventReason>;

export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The pressed state of the toggle group represented by an array of the values of all pressed toggle buttons.
	 *
	 * To render an uncontrolled toggle group, use the `defaultValue` prop instead.
	 * @default []
	 */
	value?: readonly string[];
	/**
	 * The pressed state of the toggle group represented by an array of
	 * the values of all pressed toggle buttons.
	 * This is the uncontrolled counterpart of `value`.
	 */
	defaultValue?: readonly string[];
	/**
	 * Whether the toggle group should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean | null;
	/** @default 'horizontal' */
	orientation?: ToggleGroupOrientation;
	/**
	 * Whether to loop keyboard focus back to the first item
	 * when the end of the list is reached while using the arrow keys.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * When `false` only one item in the group can be pressed. If any item in
	 * the group becomes pressed, the others will become unpressed.
	 * When `true` multiple items can be pressed.
	 * @default false
	 */
	multiple?: boolean;
	/** Callback fired when the pressed states of the toggle group changes. */
	onValueChange?: (value: string[], eventDetails: ToggleGroupChangeEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: ToggleGroupState, children: RenderChildren]
	>;
	children?: Snippet;
}
