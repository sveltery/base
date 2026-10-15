import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { RenderChildren } from '../internal/render-children.js';

export interface ToggleState {
	/** Whether the toggle is currently pressed. */
	pressed: boolean;
	/** Whether the toggle should ignore user interaction. */
	disabled: boolean;
}

export type ToggleChangeEventReason = typeof REASONS.none;
export type ToggleChangeEventDetails = BaseUIChangeEventDetails<ToggleChangeEventReason>;

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * Handlers are typed for a generic element so the same object spreads onto a
 * `<button>` or, with `nativeButton={false}`, a `<span>`.
 */
export type ToggleHostProps = HTMLAttributes<HTMLElement>;

export interface ToggleProps extends Omit<HTMLButtonAttributes, 'children'> {
	/**
	 * Whether the toggle is pressed.
	 * Use `bind:pressed` to share it with the parent.
	 * A value passed without `bind:` holds until the parent changes it. Inside a group, the group value wins.
	 * @default false
	 */
	pressed?: boolean;
	/** Whether the toggle should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Identifies this toggle inside a ToggleGroup.
	 * An empty string is treated as omitted and replaced with a generated id.
	 */
	value?: string;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Called before the pressed state changes. Call `eventDetails.cancel()` to veto it. */
	onPressedChange?: (pressed: boolean, eventDetails: ToggleChangeEventDetails) => void;
	/** Runs before the Toggle's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLButtonAttributes['onclick'];
	/** Replace the default `<button>`. Spread `props` onto the host element. */
	render?: Snippet<[props: ToggleHostProps, state: ToggleState, children: RenderChildren]>;
	children?: Snippet;
}
