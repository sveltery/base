import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type { BaseUIChangeEventDetails, BaseUIGenericEventDetails, REASONS } from '@sveltery/utils';
import type { OTPValidationType } from './otp.js';
import type { RenderChildren } from '../internal/render-children.js';

export type OTPFieldValidationType = OTPValidationType;

export type OTPFieldChangeEventReason =
	| typeof REASONS.inputChange
	| typeof REASONS.inputClear
	| typeof REASONS.inputPaste
	| typeof REASONS.keyboard;

export type OTPFieldChangeEventDetails = BaseUIChangeEventDetails<OTPFieldChangeEventReason>;

export type OTPFieldInvalidEventReason = typeof REASONS.inputChange | typeof REASONS.inputPaste;
export type OTPFieldInvalidEventDetails = BaseUIGenericEventDetails<OTPFieldInvalidEventReason>;

export type OTPFieldCompleteEventReason = typeof REASONS.inputChange | typeof REASONS.inputPaste;
export type OTPFieldCompleteEventDetails = BaseUIGenericEventDetails<OTPFieldCompleteEventReason>;

export interface OTPFieldRootState extends FieldRootState {
	/** Whether all slots are filled. */
	complete: boolean;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** The number of OTP input slots. */
	length: number;
	/** Whether the user should be unable to change the field value. */
	readOnly: boolean;
	/** Whether the user must enter a value before submitting a form. */
	required: boolean;
	/** The OTP value. */
	value: string;
}

export interface OTPFieldInputState extends Omit<OTPFieldRootState, 'filled' | 'value'> {
	/** Whether this input contains a character. */
	filled: boolean;
	/** The input index. */
	index: number;
	/** The character rendered in this slot. */
	value: string;
}

type RootRender = Snippet<
	[props: HTMLAttributes<HTMLDivElement>, state: OTPFieldRootState, children: RenderChildren]
>;

export interface OTPFieldRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The id of the first input element.
	 * Subsequent inputs derive their ids from it (`{id}-2`, `{id}-3`, and so on).
	 */
	id?: string | null;
	/**
	 * The input autocomplete attribute. Applied to the first slot and hidden validation input.
	 * @default 'one-time-code'
	 */
	autocomplete?: HTMLInputAttributes['autocomplete'];
	/**
	 * A string specifying the `form` element with which the hidden input is associated.
	 * This string's value must match the id of a `form` element in the same document.
	 */
	form?: string | null;
	/**
	 * The number of OTP input slots.
	 * Required so the root can clamp values, detect completion, and generate
	 * consistent validation markup before all slots hydrate.
	 */
	length: number;
	/** Whether to submit the owning form when the OTP becomes complete. @default false */
	autoSubmit?: boolean;
	/**
	 * Whether the slot inputs should mask entered characters.
	 * Pass `type` directly to individual `<OTPField.Input>` parts to use a custom
	 * input type.
	 * @default false
	 */
	mask?: boolean;
	/**
	 * The virtual keyboard hint applied to the slot inputs and hidden validation input.
	 *
	 * Built-in validation modes provide sensible defaults, but you can override them when needed.
	 */
	inputmode?: HTMLInputAttributes['inputmode'];
	/**
	 * The type of input validation to apply to the OTP value.
	 * @default 'numeric'
	 */
	validationType?: OTPFieldValidationType;
	/**
	 * Function that normalizes the OTP value after whitespace and `validationType` filtering.
	 * It runs whenever OTP Field normalizes a value, including initial/default values, controlled
	 * values, and user edits.
	 *
	 * The returned value is filtered by `validationType` again, then clamped to `length`.
	 * It should be idempotent because OTP Field may normalize the same value more than once while
	 * handling edits, storing state, and rendering controlled or uncontrolled values. Non-idempotent
	 * normalizers can compound across those normalization passes. Characters rejected while
	 * normalizing typed or pasted text are reported through `onValueInvalid`.
	 */
	normalizeValue?: (value: string) => string;
	/** Whether the user must enter a value before submitting a form. @default false */
	required?: boolean | null;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean | null;
	/** Whether the user should be unable to change the field value. @default false */
	readonly?: boolean | null;
	/** Identifies the field when a form is submitted. */
	name?: string | null;
	/** The OTP value. */
	value?: string;
	/** The uncontrolled OTP value when the component is initially rendered. */
	defaultValue?: string;
	/**
	 * Callback fired when the OTP value changes.
	 *
	 * The `eventDetails.reason` indicates what triggered the change:
	 * - `'input-change'` for typing or autofill
	 * - `'input-clear'` when a character is removed by text input
	 * - `'input-paste'` for paste interactions
	 * - `'keyboard'` for keyboard interactions that change the value
	 */
	onValueChange?: (value: string, eventDetails: OTPFieldChangeEventDetails) => void;
	/**
	 * Callback fired when entered text contains characters that are rejected by validation or
	 * normalization before the OTP value updates.
	 *
	 * The `value` argument is the attempted user-entered string before normalization.
	 */
	onValueInvalid?: (value: string, eventDetails: OTPFieldInvalidEventDetails) => void;
	/**
	 * Callback function that is fired when the OTP value becomes complete, or when a complete value
	 * is pasted while the OTP is already complete.
	 *
	 * When the value changes, it runs later than `onValueChange`, after the internal value update is
	 * applied. If a complete pasted value matches the current value, `onValueChange` does not fire.
	 *
	 * If `autoSubmit` is enabled, it runs immediately before the owning form is submitted.
	 */
	onValueComplete?: (value: string, eventDetails: OTPFieldCompleteEventDetails) => void;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: RootRender;
	children?: Snippet;
}

export interface OTPFieldInputProps extends Omit<HTMLInputAttributes, 'children' | 'value'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLInputAttributes, state: OTPFieldInputState, children: RenderChildren]
	>;
	children?: Snippet;
}
