import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

export interface SwitchRootState {
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
	 * Use `bind:checked` to share it with the parent.
	 * @default false
	 */
	checked?: boolean;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean;
	/**
	 * Whether the user should be unable to activate or deactivate the switch.
	 * @default false
	 */
	readOnly?: boolean;
	/**
	 * Whether the user must activate the switch before submitting a form.
	 * @default false
	 */
	required?: boolean;
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
	 * The value submitted with the form when the switch is on.
	 * By default, the switch submits `"on"`, matching a native checkbox.
	 */
	value?: string;
	/**
	 * The value submitted with the form when the switch is off.
	 * By default, an unchecked switch does not submit a value.
	 */
	uncheckedValue?: string;
	/**
	 * Identifies the form that owns the hidden input.
	 * Useful when the switch is rendered outside the form.
	 */
	form?: string;
	/**
	 * The id of the hidden input.
	 * When `nativeButton` is true, the id is applied to the root element instead.
	 */
	id?: string;
	/** Called before the checked state changes. Call `eventDetails.cancel()` to veto it. */
	onCheckedChange?: (checked: boolean, eventDetails: SwitchRootChangeEventDetails) => void;
	/** Runs before the switch's click handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: SwitchHostProps, state: SwitchRootState]>;
	children?: Snippet;
}

export interface SwitchThumbProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLSpanElement>, state: SwitchThumbState]>;
	children?: Snippet;
}
