import type { Snippet } from 'svelte';
import type {
	HTMLAnchorAttributes,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLInputAttributes
} from 'svelte/elements';
import type { SeparatorProps, SeparatorState } from '../separator/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export type ToolbarOrientation = 'horizontal' | 'vertical';

export interface ToolbarRootState {
	/** Whether the toolbar should ignore user interaction. */
	disabled: boolean;
	/** The toolbar orientation. */
	orientation: ToolbarOrientation;
}

export interface ToolbarRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** @default false */
	disabled?: boolean | null;
	/** The orientation of the toolbar. @default 'horizontal' */
	orientation?: ToolbarOrientation;
	/**
	 * If `true`, using keyboard navigation will wrap focus to the other end of the toolbar once the end is reached.
	 * @default true
	 */
	loopFocus?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: ToolbarRootState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ToolbarButtonState extends ToolbarRootState {
	/** Whether the button should ignore user interaction. */
	disabled: boolean;
	/** Whether the button remains focusable when disabled. */
	focusable: boolean;
}

/**
 * Props passed to a `render` snippet. Spread them onto the host element.
 * Handlers are typed for a generic element so the same object spreads onto a
 * `<button>`, `<span>`, or `<a>`. `disabled` lets a rendered part, such as a
 * Switch or a Menu.Trigger, disable itself. A focusable disabled native button
 * still ends without the `disabled` attribute.
 */
export type ToolbarButtonHostProps = HTMLAttributes<HTMLElement> & { disabled?: boolean };

export interface ToolbarButtonProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	/**
	 * When `true` the item is disabled.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * When `true` the item remains focusable when disabled.
	 * @default true
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
	render?: Snippet<
		[props: ToolbarButtonHostProps, state: ToolbarButtonState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type ToolbarGroupState = ToolbarRootState;

export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * When `true` all toolbar items in the group are disabled.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: ToolbarGroupState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ToolbarLinkState {
	/** The toolbar orientation. */
	orientation: ToolbarOrientation;
}

export type ToolbarLinkHostProps = HTMLAnchorAttributes;

export interface ToolbarLinkProps extends Omit<HTMLAnchorAttributes, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: ToolbarLinkHostProps, state: ToolbarLinkState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface ToolbarInputState extends ToolbarRootState {
	/** Whether the input should ignore user interaction. */
	disabled: boolean;
	/** Whether the input remains focusable when disabled. */
	focusable: boolean;
}

export type ToolbarInputHostProps = HTMLInputAttributes;

export interface ToolbarInputProps extends Omit<HTMLInputAttributes, 'children' | 'disabled'> {
	/**
	 * When `true` the item is disabled.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * When `true` the item remains focusable when disabled.
	 * @default true
	 */
	focusableWhenDisabled?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element and the component's state.
	 */
	render?: Snippet<[props: ToolbarInputHostProps, state: ToolbarInputState]>;
}

export type ToolbarSeparatorState = SeparatorState;

export interface ToolbarSeparatorProps extends SeparatorProps {
	/**
	 * The orientation of the separator. Defaults to the opposite of the toolbar's
	 * orientation, so a horizontal toolbar renders vertical separators.
	 */
	orientation?: ToolbarOrientation;
}
