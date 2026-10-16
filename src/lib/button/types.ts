import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

/** State passed to Button class/style consumers and render snippets. */
export interface ButtonState {
	/** Whether the button should ignore user interaction. */
	disabled: boolean;
}

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * Handlers are typed for a generic element so the same object spreads onto a
 * `<button>`, `<span>` or `<a>`. Native hosts also receive `type` and, when
 * disabled, the `disabled` attribute at runtime.
 */
export type ButtonHostProps = HTMLAttributes<HTMLElement>;

export interface ButtonProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	/** Whether the button should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Whether the button should be focusable when disabled.
	 * @default false
	 */
	focusableWhenDisabled?: boolean;
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs for a click the button does not ignore. */
	onclick?: HTMLButtonAttributes['onclick'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: ButtonHostProps, state: ButtonState, children: RenderChildren]>;
	children?: Snippet;
}
