import FormRoot from './Form.svelte';
import FormError from './FormError.svelte';

/** `<Form>`, with `<Form.Error>` for the messages no field shows. */
export const Form: typeof FormRoot & { readonly Error: typeof FormError } = Object.assign(
	FormRoot,
	{ Error: FormError }
);

export type * from './types.js';
export type {
	ControlKind,
	ControlType,
	ControlTypeProp,
	EnhanceInstance,
	EnhanceInstanceOf,
	EnhanceSubmission,
	FieldHandle,
	FormIssue,
	FormSource
} from './source.js';
