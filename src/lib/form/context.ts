// Derived from Base UI v1.8.0 packages/react/src/internals/form-context/FormContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, hasContext, setContext } from 'svelte';
import type { FormErrors, FormField, FormValidationMode } from './types.js';

const FORM_CONTEXT = Symbol('form');

export interface FormContextValue {
	elementRef: { current: HTMLFormElement | null };
	formRef: { current: { fields: Map<string, FormField> } };
	submitCountRef: { current: number };
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
	elementRef: { current: null },
	formRef: { current: { fields: new Map() } },
	submitCountRef: { current: 0 },
	validationMode: 'onSubmit',
	errors: EMPTY_ERRORS,
	clearErrors() {}
};

export function setFormContext(context: FormContextValue) {
	setContext(FORM_CONTEXT, context);
}

export function useFormContext(): FormContextValue {
	if (!hasContext(FORM_CONTEXT)) return DEFAULT_FORM_CONTEXT;
	return getContext<FormContextValue>(FORM_CONTEXT);
}
