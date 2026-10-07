import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

export interface ToggleState {
	/** Whether the toggle is currently pressed. */
	pressed: boolean;
	/** Whether the toggle should ignore user interaction. */
	disabled: boolean;
}

export type ToggleChangeEventReason = typeof REASONS.none;
export type ToggleChangeEventDetails = BaseUIChangeEventDetails<ToggleChangeEventReason>;

export interface ToggleProps extends Omit<HTMLButtonAttributes, 'children'> {
	/** Whether the toggle is pressed. Use `bind:pressed` to share it with the parent. @default false */
	pressed?: boolean;
	/** Whether the toggle should ignore user interaction. @default false */
	disabled?: boolean;
	/** Called before the pressed state changes. Call `eventDetails.cancel()` to veto it. */
	onPressedChange?: (pressed: boolean, eventDetails: ToggleChangeEventDetails) => void;
	/** Runs before the Toggle's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLButtonAttributes['onclick'];
	/** Replace the default `<button>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLButtonAttributes, state: ToggleState]>;
	children?: Snippet;
}
