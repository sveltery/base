import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
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

export type SwitchRootChangeEventReason = typeof REASONS.none;
export type SwitchRootChangeEventDetails = BaseUIChangeEventDetails<SwitchRootChangeEventReason>;

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * The default host is a `<span>`. A native `<button>` host sets `nativeButton`.
 */
export type SwitchHostProps = HTMLAttributes<HTMLElement>;

export interface SwitchRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
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
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `true` if the rendered element is a native button.
	 * @default false
	 */
	nativeButton?: boolean;
	/** Identifies the field when a form is submitted. */
	name?: string | null;
	/**
	 * The value submitted with the form when the switch is on.
	 * By default, switch submits the "on" value, matching native checkbox behavior.
	 */
	value?: string;
	/**
	 * The value submitted with the form when the switch is off.
	 * By default, unchecked switches do not submit any value, matching native checkbox behavior.
	 */
	uncheckedValue?: string;
	/**
	 * Identifies the form that owns the hidden input.
	 * Useful when the switch is rendered outside the form.
	 */
	form?: string | null;
	/**
	 * The id of the hidden input element.
	 *
	 * When `nativeButton` is `true`, the id is applied to the root element.
	 */
	id?: string | null;
	/** Event handler called when the switch is activated or deactivated. */
	onCheckedChange?: (checked: boolean, eventDetails: SwitchRootChangeEventDetails) => void;
	/** Runs before the switch's click handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: SwitchHostProps, state: SwitchRootState, children: RenderChildren]>;
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
