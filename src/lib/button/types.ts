import type { Snippet } from 'svelte';
import type { DOMAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

/** State passed to Button class/style consumers and render snippets. */
export interface ButtonState {
	/** Whether the button should ignore user interaction. */
	disabled: boolean;
}

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * Handlers are typed for a generic element so the same object spreads onto a
 * `<button>`, `<span>` or `<a>`, and for `Host`, the element the snippet's `props` names.
 * Native hosts also receive `type` and, when disabled, the `disabled` attribute at runtime.
 */
export type ButtonHostProps<Host extends HTMLElement = HTMLElement> = HTMLAttributes<HTMLElement> &
	HTMLAttributes<Host>;

/**
 * `Host` is the element that receives the handlers. It is a `<button>` unless the `props`
 * parameter of the `render` snippet names another element, such as `HTMLAnchorAttributes`.
 */
export interface ButtonProps<Host extends HTMLElement = HTMLButtonElement>
	extends
		Omit<HTMLButtonAttributes, keyof DOMAttributes<HTMLButtonElement> | 'disabled'>,
		DOMAttributes<NoInfer<Host>> {
	/** Whether the button should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Whether a disabled button stays in the tab order.
	 * Native buttons then use `aria-disabled` instead of the `disabled` attribute.
	 * @default false
	 */
	focusableWhenDisabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs for a click the button does not ignore. */
	onclick?: DOMAttributes<NoInfer<Host>>['onclick'];
	/** Replace the default `<button>`. Spread `props` onto the host element. */
	render?: Snippet<[props: ButtonHostProps<Host>, state: ButtonState, children: RenderChildren]>;
	children?: Snippet;
}
