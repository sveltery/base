import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLFormAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';
import type { RemoteFormSource } from './remote-form.js';

export type { RemoteFormIssue, RemoteFormSource } from './remote-form.js';

export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';

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
	/** Whether the field shows as invalid through its `invalid` prop or external errors. */
	readonly invalid: boolean;
	/** Focusable control, or null when this field has none. Read when submitting. */
	control: HTMLElement | null;
	getValue: () => unknown;
	/** Whether the element is one of this field's controls, so its `invalid` event belongs to the field. */
	owns: (element: Element) => boolean;
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

interface FormCommonProps extends Omit<
	HTMLFormAttributes,
	'children' | 'onsubmit' | 'method' | 'action'
> {
	/**
	 * Determines when Field shows native and `validate` messages.
	 * The `validationMode` prop on `<Field.Root>` takes precedence over this.
	 * It never asks a remote form to validate.
	 *
	 * - `onSubmit` (default): shows messages when the form is submitted, afterwards fields re-validate on change.
	 * - `onBlur`: shows a field's messages when it loses focus.
	 * - `onChange`: shows a field's messages on every change to its value.
	 * @default 'onSubmit'
	 */
	validationMode?: FormValidationMode;
	/**
	 * How long a Field waits between `validate` calls in `validationMode="onChange"`,
	 * in milliseconds. The `validationDebounceTime` prop on `<Field.Root>` takes precedence over this.
	 * @default 0
	 */
	validationDebounceTime?: number;
	/**
	 * Whether the browser's built-in constraint validation is off. Leave it off: the browser's
	 * check is what keeps an invalid form from submitting, with and without JavaScript.
	 * @default false
	 */
	novalidate?: HTMLFormAttributes['novalidate'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: HTMLFormAttributes, state: FormState, children: RenderChildren]>;
	children?: Snippet;
}

interface RemoteFormProps extends FormCommonProps {
	/**
	 * A SvelteKit remote form, an instance from its `for(id)`, or the value its `enhance()`
	 * returns. Form takes the form's `method`, `action` and submit handling from it, and Fields
	 * read their issues from it by their `name`.
	 */
	form: RemoteFormSource;
	errors?: never;
	values?: never;
	onsubmit?: never;
	method?: never;
	action?: never;
}

interface PlainFormProps extends FormCommonProps {
	form?: never;
	/**
	 * Validation errors returned externally, typically after submission by a server or a form action.
	 * This should be an object where keys correspond to the `name` attribute on `<Field.Root>`,
	 * and values correspond to error(s) related to that field. The key `''` holds errors that
	 * belong to no field, which `<Form.Error>` shows.
	 */
	errors?: FormErrors;
	/**
	 * Values to put back into controls by name, typically after a form action failed.
	 * A value here wins over a control's `defaultValue`.
	 */
	values?: Record<string, unknown>;
	/**
	 * Native submit listener. The browser fires it only when every control passes
	 * constraint validation.
	 */
	onsubmit?: HTMLFormAttributes['onsubmit'];
	/** The HTTP method of a native post. A remote form in `form` sets it instead. */
	method?: HTMLFormAttributes['method'];
	/** The URL of a native post. A remote form in `form` sets it instead. */
	action?: HTMLFormAttributes['action'];
}

/** Either a remote form in `form`, or a plain form with `errors`, `values` and `onsubmit`. */
export type FormProps = RemoteFormProps | PlainFormProps;

export interface FormErrorState {
	/** The transition status of the error message. */
	transitionStatus: 'starting' | 'ending' | 'idle' | undefined;
}

export interface FormErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Determines whether to show the message. A form-level issue counts as `customError`.
	 * Specifying `true` always shows the element.
	 */
	match?: boolean | keyof ValidityState;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FormErrorState, children: RenderChildren]
	>;
	/** Static content, or a snippet that receives the messages. */
	children?: Snippet | Snippet<[messages: string[]]>;
}
