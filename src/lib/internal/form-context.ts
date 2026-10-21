// Derived from Base UI v1.9.0 packages/react/src/internals/form-context/FormContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { FormErrors, FormField, FormValidationMode } from '../form/types.js';
import type { RemoteFormIssue, RemoteFormSource } from '../form/remote-form.js';
import { defineOptionalContext } from './context.js';

export interface FormContextValue {
	/** Form element, or null before the host mounts and after it unmounts. */
	readonly element: HTMLFormElement | null;
	fields: Map<string, FormField>;
	/** How many submits have reached field validation, blocked ones included. */
	readonly submitCount: number;
	/** How many remote submits have finished. A dismissed issue stays hidden until the next one. */
	readonly settleCount: number;
	readonly validationMode: FormValidationMode;
	readonly validationDebounceTime: number | undefined;
	readonly errors: FormErrors;
	/** Values to repopulate controls by name after a failed form action. */
	readonly values: Readonly<Record<string, unknown>>;
	clearErrors: (name: string | undefined) => void;
	/** The remote form, or `undefined` for a plain form. */
	readonly remote: RemoteFormSource | undefined;
	/**
	 * Every issue the remote form holds. One array per set of issues Kit holds, so a Field can
	 * tell issues that arrived after an edit from the ones the edit dismissed.
	 */
	readonly remoteIssues: readonly RemoteFormIssue[];
	/** Messages that belong to no field: `errors['']`, or the remote form's issues with an empty path. */
	readonly formMessages: readonly string[];
	/** The id of `<Form.Error>`, which `<form>` lists in `aria-describedby` while it has messages. */
	readonly errorId: string | undefined;
	readonly pending: boolean;
	readonly submitted: boolean;
}

const EMPTY_ERRORS: FormErrors = Object.freeze({});
const EMPTY_LIST: readonly never[] = Object.freeze([]);

/**
 * Shared fallback when a field reads the context outside `<Form>`.
 * One map for every missing provider, matching the React default context value.
 */
const DEFAULT_FORM_CONTEXT: FormContextValue = {
	element: null,
	fields: new Map(),
	submitCount: 0,
	settleCount: 0,
	validationMode: 'onSubmit',
	validationDebounceTime: undefined,
	errors: EMPTY_ERRORS,
	values: EMPTY_ERRORS,
	clearErrors() {},
	remote: undefined,
	remoteIssues: EMPTY_LIST,
	formMessages: EMPTY_LIST,
	errorId: undefined,
	pending: false,
	submitted: false
};

export const [useFormContext, setFormContext] =
	defineOptionalContext<FormContextValue>(DEFAULT_FORM_CONTEXT);

/** Whether a `<Form>` provides the context. */
export function isFormProvided(form: FormContextValue) {
	return form !== DEFAULT_FORM_CONTEXT;
}

/** Size of the shared map used when no `<Form>` provides a context. */
export function unprovidedFormFieldCount() {
	return DEFAULT_FORM_CONTEXT.fields.size;
}

/** The value Form `values` holds for a control's name, or `fallback` when it holds none. */
export function readFormValue<T>(form: FormContextValue, name: string | undefined, fallback: T) {
	if (!name || !Object.hasOwn(form.values, name)) return fallback;
	return form.values[name] as T;
}
