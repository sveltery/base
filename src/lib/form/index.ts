import FormRoot from './Form.svelte';
import FormError from './FormError.svelte';

/** `<Form>` renders the form. `<Form.Error>` shows the messages that belong to no field. */
export const Form: typeof FormRoot & { readonly Error: typeof FormError } = Object.assign(
	FormRoot,
	{ Error: FormError }
);

export type * from './types.js';
