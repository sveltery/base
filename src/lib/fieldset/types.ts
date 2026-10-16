import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLFieldsetAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

export interface FieldsetRootState {
	/** Whether the fieldset should ignore user interaction. */
	disabled: boolean;
}

export interface FieldsetRootProps extends Omit<HTMLFieldsetAttributes, 'children'> {
	/** Whether the fieldset should ignore user interaction. @default false */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLFieldsetAttributes, state: FieldsetRootState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface FieldsetLegendState {
	/** Whether the fieldset should ignore user interaction. */
	disabled: boolean;
}

export interface FieldsetLegendProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: FieldsetLegendState, children: RenderChildren]
	>;
	children?: Snippet;
}
