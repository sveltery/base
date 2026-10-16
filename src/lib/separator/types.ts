import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

export interface SeparatorState {
	/** The orientation of the separator. */
	orientation: 'horizontal' | 'vertical';
}

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The orientation of the separator. @default 'horizontal' */
	orientation?: SeparatorState['orientation'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: SeparatorState, children: RenderChildren]
	>;
	children?: Snippet;
}
