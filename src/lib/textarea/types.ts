import type { Snippet } from 'svelte';
import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { FieldControlState } from '../field/types.js';
import type { RenderChildren } from '../internal/render-children.js';

/** Same state `Field.Control` publishes, including validity from `Field.Root`. */
export type TextareaState = FieldControlState;

export interface TextareaProps extends Omit<
	HTMLTextareaAttributes,
	'children' | 'value' | 'defaultValue'
> {
	/**
	 * A textarea has no input type. Declaring it `never` makes a remote form spread of another
	 * kind, such as `.as('number')`, a type error, while `.as('text')` passes.
	 */
	type?: never;
	/** The value of the textarea. */
	value?: string | null;
	/** The value an empty `value` starts from, and the value a form reset restores. */
	defaultValue?: string | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: HTMLTextareaAttributes, state: TextareaState, children: RenderChildren]>;
}
