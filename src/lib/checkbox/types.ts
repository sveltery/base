import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
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

export type CheckboxRootChangeEventReason = typeof REASONS.none;
export type CheckboxRootChangeEventDetails =
	BaseUIChangeEventDetails<CheckboxRootChangeEventReason>;

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * The default host is a `<span>`. A native `<button>` host sets `nativeButton`.
 */
export type CheckboxHostProps = HTMLAttributes<HTMLElement>;

export interface CheckboxRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
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
	 * Identifies the form that owns the hidden input.
	 * Useful when the checkbox is rendered outside the form.
	 */
	form?: string | null;
	/** The id of the input element. */
	id?: string | null;
	/** Event handler called when the checkbox is ticked or unticked. */
	onCheckedChange?: (checked: boolean, eventDetails: CheckboxRootChangeEventDetails) => void;
	/** Runs before the checkbox's click handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: CheckboxHostProps, state: CheckboxRootState, children: RenderChildren]>;
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
