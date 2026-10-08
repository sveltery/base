import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

import type { ToolbarOrientation } from '../internal/toolbar-roving.svelte.js';

export type { ToolbarOrientation };

export interface ToolbarRootState {
	/** Whether the toolbar should ignore user interaction. */
	disabled: boolean;
	/** The toolbar orientation. */
	orientation: ToolbarOrientation;
}

export interface ToolbarRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Whether the toolbar's buttons ignore user interaction. Links stay active. @default false */
	disabled?: boolean;
	/** The orientation of the toolbar. @default 'horizontal' */
	orientation?: ToolbarOrientation;
	/**
	 * When `true`, keyboard navigation wraps from the last item to the first.
	 * @default true
	 */
	loopFocus?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: ToolbarRootState]>;
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
 * `<button>`, `<span>`, or `<a>`.
 */
export type ToolbarButtonHostProps = HTMLAttributes<HTMLElement>;

export interface ToolbarButtonProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	/** Whether the button should ignore user interaction. @default false */
	disabled?: boolean;
	/**
	 * Whether a disabled button stays in the toolbar's arrow order.
	 * @default true
	 */
	focusableWhenDisabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs for a click the button does not ignore. */
	onclick?: HTMLButtonAttributes['onclick'];
	/** Replace the default `<button>`. Spread `props` onto the host element. */
	render?: Snippet<[props: ToolbarButtonHostProps, state: ToolbarButtonState]>;
	children?: Snippet;
}

export type ToolbarGroupState = ToolbarRootState;

export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Whether every button in the group ignores user interaction. Links stay active. @default false */
	disabled?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: ToolbarGroupState]>;
	children?: Snippet;
}

export interface ToolbarLinkState {
	/** The toolbar orientation. */
	orientation: ToolbarOrientation;
}

export type ToolbarLinkHostProps = HTMLAnchorAttributes;

export interface ToolbarLinkProps extends Omit<HTMLAnchorAttributes, 'children'> {
	/** Replace the default `<a>`. Spread `props` onto the host element. */
	render?: Snippet<[props: ToolbarLinkHostProps, state: ToolbarLinkState]>;
	children?: Snippet;
}
