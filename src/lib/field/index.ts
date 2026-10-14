import Control from './FieldControl.svelte';
import Description from './FieldDescription.svelte';
import Error from './FieldError.svelte';
import Item from './FieldItem.svelte';
import Label from './FieldLabel.svelte';
import Root from './FieldRoot.svelte';
import Validity from './FieldValidity.svelte';

export const Field: {
	readonly Root: typeof Root;
	readonly Label: typeof Label;
	readonly Control: typeof Control;
	readonly Error: typeof Error;
	readonly Description: typeof Description;
	readonly Validity: typeof Validity;
	readonly Item: typeof Item;
} = {
	Root,
	Label,
	Control,
	Error,
	Description,
	Validity,
	Item
};

export type * from './types.js';
export * from './data-attributes.js';
