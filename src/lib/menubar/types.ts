// Derived from Base UI v1.9.0 packages/react/src/menubar/Menubar.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';
import type { MenuOrientation } from '../menu/types.js';

export type MenubarOrientation = MenuOrientation;

export interface MenubarState {
	/** The orientation of the menubar. */
	orientation: MenubarOrientation;
	/** Whether the menubar is modal. */
	modal: boolean;
	/** Whether any menu within the menubar is open. */
	hasSubmenuOpen: boolean;
}

export interface MenubarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Whether the menubar is modal. @default true */
	modal?: boolean;
	/** Whether the whole menubar is disabled. @default false */
	disabled?: boolean;
	/** The orientation of the menubar. @default 'horizontal' */
	orientation?: MenubarOrientation;
	/**
	 * Whether to loop keyboard focus back to the first item when the end of the list is reached
	 * while using the arrow keys.
	 * @default true
	 */
	loopFocus?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: MenubarState, children: RenderChildren]
	>;
	children?: Snippet;
}
