// Derived from Base UI v1.9.0 packages/react/src/internals/form-context/FormContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { FormErrors, FormField, FormValidationMode } from '../form/types.js';
import { defineOptionalContext } from './context.js';

export interface FormContextValue {
	/** Form element, or null before the host mounts and after it unmounts. */
	readonly element: HTMLFormElement | null;
	fields: Map<string, FormField>;
	/** How many submits have reached field validation. Read during `validate`. */
	readonly submitCount: number;
	readonly validationMode: FormValidationMode;
	readonly errors: FormErrors;
	clearErrors: (name: string | undefined) => void;
}

const EMPTY_ERRORS: FormErrors = Object.freeze({});

/**
 * Shared fallback when a field reads the context outside `<Form>`.
 * One map for every missing provider, matching the React default context value.
 */
const DEFAULT_FORM_CONTEXT: FormContextValue = {
	element: null,
	fields: new Map(),
	submitCount: 0,
	validationMode: 'onSubmit',
	errors: EMPTY_ERRORS,
	clearErrors() {}
};

export const [useFormContext, setFormContext] =
	defineOptionalContext<FormContextValue>(DEFAULT_FORM_CONTEXT);

/** Size of the shared map used when no `<Form>` provides a context. */
export function unprovidedFormFieldCount() {
	return DEFAULT_FORM_CONTEXT.fields.size;
}
