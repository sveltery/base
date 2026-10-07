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

export type ToggleClickEvent = MouseEvent & {
	currentTarget: EventTarget & HTMLButtonElement;
	/** Skip the Toggle's own click handling for this event. */
	preventBaseUIHandler: () => void;
};

export interface ToggleProps extends Omit<HTMLButtonAttributes, 'onclick' | 'children'> {
	/** Controlled pressed state. */
	pressed?: boolean;
	/** Initial pressed state when uncontrolled. @default false */
	defaultPressed?: boolean;
	/** Whether the toggle should ignore user interaction. @default false */
	disabled?: boolean;
	/** Called before the pressed state changes. Call `eventDetails.cancel()` to veto it. */
	onPressedChange?: (pressed: boolean, eventDetails: ToggleChangeEventDetails) => void;
	/** Runs before the Toggle's handler. */
	onclick?: (event: ToggleClickEvent) => void;
	/** Replace the default `<button>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLButtonAttributes, state: ToggleState]>;
	children?: Snippet;
	/** The rendered host element. */
	ref?: HTMLElement | null;
}
