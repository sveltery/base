import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

export interface RadioGroupState {
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
	 * The selected radio's value.
	 * Use `bind:value` to share it with the parent.
	 * Omit it to start with nothing selected. A one-way `value` sets it until the parent changes it.
	 * Hold the value with `eventDetails.cancel()` to keep a click from sticking.
	 * Object values are compared with `===`. Store them with `$state.raw`.
	 */
	value?: Value;
	/** Whether the group should ignore user interaction. @default false */
	disabled?: boolean;
	/**
	 * Whether the user should be unable to select a different radio button in the group.
	 * @default false
	 */
	readOnly?: boolean;
	/**
	 * Whether the user must choose a value before submitting a form.
	 * @default false
	 */
	required?: boolean;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/**
	 * Identifies the form that owns the radio inputs.
	 * Useful when the radio group is rendered outside the form.
	 */
	form?: string;
	/** Called before the value changes. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: Value, eventDetails: RadioGroupChangeEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: RadioGroupState]>;
	children?: Snippet;
}
