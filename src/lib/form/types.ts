import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { BaseUIGenericEventDetails, REASONS } from '../internal/event-details.js';

export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';

export type FormSubmitEventReason = typeof REASONS.none;
export type FormSubmitEventDetails = BaseUIGenericEventDetails<FormSubmitEventReason>;

/** Server or action errors keyed by field name. Values are one message or several. */
export type FormErrors = Record<string, string | string[]>;

/**
 * Validity stored on a registered field. Field owns how this is computed.
 * Form reads `state.valid` when deciding whether submit can proceed.
 */
export interface FieldValidityData {
	state: {
		badInput: boolean;
		customError: boolean;
		patternMismatch: boolean;
		rangeOverflow: boolean;
		rangeUnderflow: boolean;
		stepMismatch: boolean;
		tooLong: boolean;
		tooShort: boolean;
		typeMismatch: boolean;
		valueMissing: boolean;
		valid: boolean | null;
	};
	error: string;
	errors: string[];
	value: unknown;
	initialValue: unknown;
}

/** One entry in the form's field registry, keyed by the field's registration id. */
export interface FormField {
	name: string | undefined;
	/**
	 * After this returns, the registry entry reflects the latest synchronous
	 * validity verdict. Async validators do not block submit.
	 */
	validate: () => void;
	validityData: FieldValidityData;
	/** Focusable control, or null when this field has none. Read when submitting. */
	control: HTMLElement | null;
	getValue: () => unknown;
}

export interface FormActions {
	/**
	 * Validates every registered field. Pass a field name to validate the first
	 * field registered under that name.
	 */
	validate: (fieldName?: string) => void;
}

/** Upstream form state is an empty object. These parts do not project state attributes. */
export type FormState = Record<string, never>;

export interface FormProps<
	FormValues extends Record<string, unknown> = Record<string, unknown>
> extends Omit<HTMLFormAttributes, 'children' | 'onsubmit' | 'novalidate'> {
	/**
	 * When fields should validate. A field's own mode takes precedence once Field is ported.
	 * @default 'onSubmit'
	 */
	validationMode?: FormValidationMode;
	/**
	 * Errors supplied from outside the form, usually after a server action.
	 * Use `bind:errors` so `clearErrors` can drop a key. A new object from the
	 * parent replaces the current errors.
	 */
	errors?: FormErrors;
	/**
	 * Native submit listener. Runs after fields validate and only when no invalid
	 * field blocks the submit. Call `event.preventDefault()` to keep the browser
	 * from navigating. This does not skip `onFormSubmit`.
	 */
	onsubmit?: HTMLFormAttributes['onsubmit'];
	/**
	 * Called with each named field's value when submit is not blocked.
	 * The native submit is cancelled before this runs.
	 */
	onFormSubmit?: (formValues: FormValues, eventDetails: FormSubmitEventDetails) => void;
	/**
	 * Imperative handle. Use `bind:actions` and call `actions.validate()`.
	 */
	actions?: FormActions;
	/**
	 * When true (the default), the browser's built-in constraint validation is off.
	 * Registered fields still validate through the form.
	 * @default true
	 */
	novalidate?: boolean;
	/** Replace the default `<form>`. Spread `props` onto the host and render `children`. */
	render?: Snippet<[props: HTMLFormAttributes, state: FormState, children: Snippet]>;
	children?: Snippet;
}
