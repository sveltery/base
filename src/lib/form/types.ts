import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLFormAttributes } from 'svelte/elements';
import type { BaseUIGenericEventDetails, REASONS } from '@sveltery/utils';
import type { RenderChildren } from '../internal/render-children.js';
import type { EnhanceInstanceOf, FormSource } from './source.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';

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
	/**
	 * Whether the field stops a submit before it reaches the source: native constraints,
	 * `validate`, `invalid` or `errors`. Source issues never do, because the source re-checks
	 * its own schema and only the server can clear a server issue.
	 */
	readonly blocksSubmit: boolean;
	/** Focusable control, or null when this field has none. Read when submitting. */
	control: HTMLElement | null;
	getValue: () => unknown;
}

/** The first invalid control in document order, and the field it belongs to. */
export interface FormFocusInvalidDetail {
	control: HTMLElement;
	field: FormField;
}

/** Methods on the `Form` instance. Reach them with `bind:this`. */
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
	FormValues extends Record<string, unknown> = Record<string, unknown>,
	S extends FormSource = FormSource
> extends Omit<HTMLFormAttributes, 'children' | 'onsubmit' | 'novalidate'> {
	/**
	 * The external owner of form state, such as a SvelteKit remote form.
	 * Its attributes and attachment go on the `<form>`. Fields bind to its `fields`.
	 */
	form?: S;
	/**
	 * Runs once the source has validated a submit, with the source's `enhance` contract.
	 * Call `submit()` to send it. Without this prop, a successful submit resets the form.
	 */
	enhance?: (instance: EnhanceInstanceOf<S>) => unknown;
	/**
	 * Determines when the form should be validated.
	 * The `validationMode` prop on `<Field.Root>` takes precedence over this.
	 *
	 * - `onSubmit` (default): validates the field when the form is submitted, afterwards fields will re-validate on change.
	 * - `onBlur`: validates a field when it loses focus.
	 * - `onChange`: validates the field on every change to its value.
	 * @default 'onSubmit'
	 */
	validationMode?: FormValidationMode;
	/**
	 * Validation errors returned externally, typically after submission by a server or a form action.
	 * This should be an object where keys correspond to the `name` attribute on `<Field.Root>`,
	 * and values correspond to error(s) related to that field.
	 */
	errors?: FormErrors;
	/**
	 * Native submit listener. Runs after fields validate and only when no invalid
	 * field blocks the submit. Call `event.preventDefault()` to keep the browser
	 * from navigating. This does not skip `onFormSubmit`.
	 */
	onsubmit?: HTMLFormAttributes['onsubmit'];
	/**
	 * Event handler called when the form is submitted.
	 * `preventDefault()` is called on the native submit event when used.
	 */
	onFormSubmit?: (formValues: FormValues, eventDetails: FormSubmitEventDetails) => void;
	/**
	 * Called in place of focusing the first invalid control, after a blocked submit or once
	 * errors or source issues arrive. Use it to reveal a control that is hidden, such as one on
	 * an inactive step. Form waits for the returned promise and the next DOM update, then
	 * focuses the control, also when the callback throws or rejects, unless focus moved while it
	 * ran. Keep a hidden step mounted, because a field that is not rendered does not register.
	 * With `novalidate={false}`, the browser handles a native constraint before Form sees the
	 * submit, so this is not called for it.
	 */
	onFocusInvalid?: (detail: FormFocusInvalidDetail) => void | Promise<void>;
	/**
	 * When true (the default), the browser's built-in constraint validation is off.
	 * Registered fields still validate through the form. It is set once the form is
	 * hydrated, so a page that has not loaded JavaScript keeps the browser's validation.
	 * @default true
	 */
	novalidate?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: HTMLFormAttributes, state: FormState, children: RenderChildren]>;
	children?: Snippet;
}

export interface FormErrorState {
	/** The transition status of the error message. */
	transitionStatus: TransitionStatusValue;
}

export interface FormErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The host's role. Focus moves to no field when only form-level messages fail a submit,
	 * so the messages are announced.
	 * @default 'alert'
	 */
	role?: HTMLAttributes<HTMLDivElement>['role'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FormErrorState, children: RenderChildren]
	>;
	/** Replaces the messages. */
	children?: Snippet;
}
