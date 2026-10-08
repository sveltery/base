import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

export interface CheckboxGroupState {
	/** Whether the group should ignore user interaction. */
	disabled: boolean;
}

export type CheckboxGroupChangeEventReason = typeof REASONS.none;
export type CheckboxGroupChangeEventDetails =
	BaseUIChangeEventDetails<CheckboxGroupChangeEventReason>;

export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Values of the checkboxes in the group that are ticked.
	 * Use `bind:value` to share the array with the parent.
	 * Omit it to start from `defaultValue`. A one-way `value` sets it until the parent changes it.
	 * `undefined` is an empty selection. Hold the array with `eventDetails.cancel()`.
	 */
	value?: string[];
	/**
	 * Ticked values when `value` is omitted, and when a controlled `value` is cleared.
	 * @default []
	 */
	defaultValue?: string[];
	/**
	 * Values of every checkbox the parent checkbox controls.
	 * Set this to render a parent checkbox with `Checkbox.Root parent`.
	 */
	allValues?: string[];
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean;
	/** Called before the value changes. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: string[], eventDetails: CheckboxGroupChangeEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: CheckboxGroupState]>;
	children?: Snippet;
}
