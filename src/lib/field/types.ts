import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';
import type { FieldValidityData, FormValidationMode, RemoteFormIssue } from '../form/types.js';
import type { RenderChildren } from '../internal/render-children.js';

export type { FieldValidityData };

export type FieldTransitionStatus = 'starting' | 'ending' | 'idle' | undefined;

export type FieldValidateResult = string | string[] | null | void;

export type FieldValidate = (
	value: unknown,
	formValues: Record<string, unknown>
) => FieldValidateResult | Promise<FieldValidateResult>;

export interface FieldRootState {
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the field has been touched. */
	touched: boolean;
	/** Whether the field value has changed from its initial value. */
	dirty: boolean;
	/** Whether the field is valid. `null` means validity is not known yet. */
	valid: boolean | null;
	/** Whether the field has a value. */
	filled: boolean;
	/** Whether the field is focused. */
	focused: boolean;
}

/** Methods on the `Field.Root` instance. Reach them with `bind:this`. */
export interface FieldRootActions {
	/** Validates the field when called. */
	validate: () => void;
}

export interface FieldRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the component should ignore user interaction.
	 * Takes precedence over the `disabled` prop on the `<Field.Control>` component.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * The field's path, such as `email`, `address.city` or `price[0]`.
	 * In a plain form it is the name the control submits under, unless the control has its own
	 * `name`, and the key into Form `errors` and `values`.
	 * In a remote form it is the path the Field reads its issues from. It is never written to an
	 * input there: the control's `.as()` spread names it.
	 */
	name?: string | null;
	/**
	 * A function for custom validation. Return a string or an array of strings with
	 * the error message(s) if the value is invalid. Returning nothing, `null`, an empty
	 * string, or an empty array means the value is valid.
	 * Asynchronous functions are supported, but they do not prevent form submission
	 * when using `validationMode="onSubmit"`.
	 */
	validate?: FieldValidate;
	/**
	 * Determines when the field should be validated.
	 * This takes precedence over the `validationMode` prop on `<Form>`.
	 *
	 * - `onSubmit`: triggers validation when the form is submitted, and re-validates on change after submission.
	 * - `onBlur`: triggers validation when the control loses focus.
	 * - `onChange`: triggers validation on every change to the control value.
	 * @default 'onSubmit'
	 */
	validationMode?: FormValidationMode;
	/**
	 * How long to wait between `validate` callbacks if
	 * `validationMode="onChange"` is used. Specified in milliseconds.
	 * @default 0
	 */
	validationDebounceTime?: number;
	/**
	 * Whether the field is invalid.
	 * Useful when the field state is controlled by an external library.
	 */
	invalid?: boolean;
	/**
	 * Whether the field's value has been changed from its initial value.
	 * Useful when the field state is controlled by an external library.
	 */
	dirty?: boolean;
	/**
	 * Whether the field has been touched.
	 * Useful when the field state is controlled by an external library.
	 */
	touched?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldRootState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type FieldControlState = FieldRootState;

export interface FieldControlProps extends Omit<
	HTMLInputAttributes,
	'children' | 'value' | 'defaultValue'
> {
	/** The value of the input. */
	value?: string | number | null;
	/** The default value of the input. Use when uncontrolled. */
	defaultValue?: string | number | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldControlState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type FieldLabelState = FieldRootState;

export interface FieldLabelProps extends Omit<HTMLLabelAttributes, 'children'> {
	/**
	 * Whether the component renders a native `<label>` element when replacing it via the `render` prop.
	 * Set to `false` if the rendered element is not a label (for example, `<div>`).
	 *
	 * This is useful to avoid inheriting label behaviors on `<button>` controls (such as `<Select.Trigger>` and `<Combobox.Trigger>`), including avoiding `:hover` on the button when hovering the label, and preventing clicks on the label from firing on the button.
	 * @default true
	 */
	nativeLabel?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldLabelState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type FieldDescriptionState = FieldRootState;

export interface FieldDescriptionProps extends Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldDescriptionState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface FieldErrorState extends FieldRootState {
	/** The transition status of the error message. */
	transitionStatus: FieldTransitionStatus;
}

export interface FieldErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Determines whether to show the error message according to the field's
	 * [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).
	 * Specifying `true` will always show the error message, and lets external libraries
	 * control the visibility.
	 */
	match?: boolean | keyof ValidityState;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldErrorState, children: RenderChildren]
	>;
	/** Static content, or a snippet that receives the messages. */
	children?: Snippet | Snippet<[messages: string[]]>;
}

export type FieldItemState = FieldRootState;

export interface FieldItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the wrapped control should ignore user interaction.
	 * The `disabled` prop on `<Field.Root>` takes precedence over this.
	 * @default false
	 */
	disabled?: boolean | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldItemState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface FieldValidityState extends Omit<FieldValidityData, 'state'> {
	/** The validity state. `customError` is true while remote issues or Form `errors` show. */
	validity: FieldValidityData['state'];
	/** The remote form's issues for this field. Empty in a plain form. */
	issues: RemoteFormIssue[];
	/** Whether the Form was submitted. */
	submitted: boolean;
	/** Whether the Form's remote submission is in flight. */
	pending: boolean;
	/** The transition status of the invalid state. */
	transitionStatus: FieldTransitionStatus;
}

export interface FieldValidityProps {
	/** Receives the field validity state. */
	children?: Snippet<[state: FieldValidityState]>;
}
