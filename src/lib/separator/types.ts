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
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: SeparatorState, children: RenderChildren]
	>;
	children?: Snippet;
}
