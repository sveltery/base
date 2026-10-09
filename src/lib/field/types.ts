import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { FieldValidityData, FormValidationMode } from '../form/types.js';
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
	 * Takes precedence over `disabled` on `<Field.Control>`.
	 * @default false
	 */
	disabled?: boolean;
	/** Identifies the field when a form is submitted. Takes precedence over the control's `name`. */
	name?: string;
	/**
	 * Custom validation. Return a message or messages when the value is invalid.
	 * An empty result is valid. Asynchronous functions do not block form submission.
	 */
	validate?: FieldValidate;
	/**
	 * When the field validates. Takes precedence over `<Form validationMode>`.
	 * @default 'onSubmit'
	 */
	validationMode?: FormValidationMode;
	/**
	 * How long to wait between `validate` callbacks when `validationMode` is `onChange`.
	 * @default 0
	 */
	validationDebounceTime?: number;
	/** Whether the field is invalid. Useful when an external library owns the state. */
	invalid?: boolean;
	/** Whether the value has changed from its initial value. */
	dirty?: boolean;
	/** Whether the field has been touched. */
	touched?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldRootState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type FieldControlState = FieldRootState;

export type FieldControlChangeEventReason = typeof REASONS.none;
export type FieldControlChangeEventDetails =
	BaseUIChangeEventDetails<FieldControlChangeEventReason>;

export interface FieldControlProps extends Omit<
	HTMLInputAttributes,
	'children' | 'value' | 'defaultValue'
> {
	/**
	 * Current value. Use `bind:value` to share it with the parent.
	 * Omit it to leave the input uncontrolled, starting from `defaultValue`.
	 */
	value?: string | number | null;
	/** Initial value of an uncontrolled input. Ignored when `value` is passed. */
	defaultValue?: string | number | null;
	/** Called when the user edits the control. `eventDetails.cancel()` vetoes the change. */
	onValueChange?: (value: string, eventDetails: FieldControlChangeEventDetails) => void;
	/** Replace the default `<input>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldControlState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type FieldLabelState = FieldRootState;

export interface FieldLabelProps extends Omit<HTMLLabelAttributes, 'children' | 'for'> {
	/**
	 * Whether the rendered element is a native `<label>`.
	 * Set `false` when `render` produces a different element.
	 * @default true
	 */
	nativeLabel?: boolean;
	/** Replace the default `<label>`. Spread `props` onto the host element. */
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
	/** Replace the default `<p>`. Spread `props` onto the host element. */
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
	 * Which validity flag shows this message.
	 * `true` always shows it. A string matches that `ValidityState` flag.
	 * Omit it, or pass `false`, to show form and client errors.
	 */
	match?: boolean | keyof ValidityState;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldErrorState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type FieldItemState = FieldRootState;

export interface FieldItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the wrapped control should ignore user interaction.
	 * `<Field.Root disabled>` takes precedence.
	 * @default false
	 */
	disabled?: boolean;
	/** Replace the default `<div>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: FieldItemState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface FieldValidityState extends Omit<FieldValidityData, 'state'> {
	/** The validity state. */
	validity: FieldValidityData['state'];
	/** The transition status of the invalid state. */
	transitionStatus: FieldTransitionStatus;
}

export interface FieldValidityProps {
	/** Receives the field validity state. */
	children?: Snippet<[state: FieldValidityState]>;
}
