// Derived from Base UI v1.9.0 packages/react/src/internals/form-context/FormContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { FormErrors, FormField, FormValidationMode } from '../form/types.js';
import type { FormSource } from '../form/source.js';
import { IssueSession } from '../form/issues.svelte.js';
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
	/** The external owner of form state passed as `form`, such as a remote form. */
	readonly source: FormSource | undefined;
	/** Which source issues are visible, and the Fields that claim them. */
	readonly issues: IssueSession;
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
	clearErrors() {},
	source: undefined,
	issues: new IssueSession(() => undefined)
};

export const [useFormContext, setFormContext] =
	defineOptionalContext<FormContextValue>(DEFAULT_FORM_CONTEXT);

/** Size of the shared map used when no `<Form>` provides a context. */
export function unprovidedFormFieldCount() {
	return DEFAULT_FORM_CONTEXT.fields.size;
}
