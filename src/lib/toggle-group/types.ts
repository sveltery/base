import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

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
	 * Values of the pressed toggles.
	 * Use `bind:value` to share the array with the parent.
	 * Omit it to start empty; a one-way `value` sets it until the parent changes it.
	 * @default []
	 */
	value?: readonly string[];
	/** Whether the group should ignore user interaction. @default false */
	disabled?: boolean;
	/** @default 'horizontal' */
	orientation?: ToggleGroupOrientation;
	/**
	 * Whether arrow keys wrap from the last item to the first.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * When false, pressing one toggle releases the others.
	 * When true, each toggle changes on its own.
	 * @default false
	 */
	multiple?: boolean;
	/** Called before the pressed values change. Call `eventDetails.cancel()` to veto it. */
	onValueChange?: (value: string[], eventDetails: ToggleGroupChangeEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: ToggleGroupState]>;
	children?: Snippet;
}
