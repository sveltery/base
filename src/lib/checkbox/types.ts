import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

/** Indicator motion phase. `undefined` is the settled phase. */
export type CheckboxIndicatorPhase = 'starting' | 'ending' | undefined;

export interface CheckboxRootState {
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
	 * Use `bind:checked` to share it with the parent.
	 * Omit it to start from `defaultChecked`. Inside a group, the group value wins.
	 * @default false
	 */
	checked?: boolean;
	/**
	 * Ticked state used when `checked` is omitted, and when a controlled `checked` is cleared.
	 * @default false
	 */
	defaultChecked?: boolean;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean;
	/**
	 * Whether the user should be unable to tick or untick the checkbox.
	 * @default false
	 */
	readOnly?: boolean;
	/**
	 * Whether the user must tick the checkbox before submitting a form.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the checkbox is in a mixed state: neither ticked nor unticked.
	 * @default false
	 */
	indeterminate?: boolean;
	/**
	 * Whether this checkbox controls every value in a parent `CheckboxGroup`.
	 * It sets `data-parent` and is left out of form submission.
	 * @default false
	 */
	parent?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `true` and render a `<button>`. The `id` is then applied to that button
	 * instead of the hidden input.
	 * @default false
	 */
	nativeButton?: boolean;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/**
	 * The value submitted with the form when the checkbox is ticked.
	 * By default, the checkbox submits `"on"`, matching a native checkbox.
	 */
	value?: string;
	/**
	 * The value submitted with the form when the checkbox is unticked.
	 * By default, an unticked checkbox does not submit a value.
	 */
	uncheckedValue?: string;
	/**
	 * Identifies the form that owns the hidden input.
	 * Useful when the checkbox is rendered outside the form.
	 */
	form?: string;
	/**
	 * The id of the hidden input.
	 * When `nativeButton` is true, the id is applied to the root element instead.
	 */
	id?: string;
	/** Called before the checked state changes. Call `eventDetails.cancel()` to veto it. */
	onCheckedChange?: (checked: boolean, eventDetails: CheckboxRootChangeEventDetails) => void;
	/** Runs before the checkbox's click handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: CheckboxHostProps, state: CheckboxRootState]>;
	children?: Snippet;
}

export interface CheckboxIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * Whether to keep the indicator in the DOM when the checkbox is unticked and not mixed.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLSpanElement>, state: CheckboxIndicatorState]>;
	children?: Snippet;
}
