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
	 * Whether the toggle button is currently pressed.
	 *
	 * To render an uncontrolled toggle, use the `defaultPressed` prop instead.
	 * @default false
	 */
	pressed?: boolean;
	/**
	 * Whether the toggle button is currently pressed.
	 * This is the uncontrolled counterpart of `pressed`.
	 * @default false
	 */
	defaultPressed?: boolean;
	/**
	 * Whether the component should ignore user interaction.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * A unique string that identifies the toggle when used
	 * inside a toggle group.
	 */
	value?: string;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** Callback fired when the pressed state is changed. */
	onPressedChange?: (pressed: boolean, eventDetails: ToggleChangeEventDetails) => void;
	/** Runs before the Toggle's handler. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLButtonAttributes['onclick'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: ToggleHostProps, state: ToggleState, children: RenderChildren]>;
	children?: Snippet;
}
