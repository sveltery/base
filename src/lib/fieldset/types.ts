import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLFieldsetAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

export interface FieldsetRootState {
	/** Whether the fieldset should ignore user interaction. */
	disabled: boolean;
}

export interface FieldsetRootProps extends Omit<HTMLFieldsetAttributes, 'children'> {
	/** Whether the fieldset should ignore user interaction. @default false */
	disabled?: boolean;
	/** Replace the default `<fieldset>`. Spread `props` onto the host element. */
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
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLDivElement>, state: FieldsetLegendState, children: RenderChildren]
	>;
	children?: Snippet;
}
