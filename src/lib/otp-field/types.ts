import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { FieldRootState } from '../field/types.js';
import type {
	BaseUIChangeEventDetails,
	BaseUIGenericEventDetails,
	REASONS
} from '../internal/event-details.js';
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
	/** The id of the first input element. Later slots use `{id}-2`, `{id}-3`, and so on. */
	id?: string;
	/**
	 * The input autocomplete attribute. Applied to the first slot and hidden validation input.
	 * @default 'one-time-code'
	 */
	autoComplete?: HTMLInputAttributes['autocomplete'];
	/**
	 * Identifies the form that owns the hidden input and the slots.
	 * The value must match a form element's id in the same document.
	 */
	form?: string;
	/**
	 * The number of OTP input slots.
	 * Required so the root can clamp values, detect completion, and render
	 * validation markup before every slot has mounted.
	 */
	length: number;
	/** Whether to submit the owning form when the OTP becomes complete. @default false */
	autoSubmit?: boolean;
	/**
	 * Whether the slot inputs should mask entered characters.
	 * Pass `type` on an individual input to override that slot.
	 * @default false
	 */
	mask?: boolean;
	/** Virtual keyboard hint for the slots and the hidden validation input. */
	inputMode?: HTMLInputAttributes['inputmode'];
	/** Which characters the OTP accepts. @default 'numeric' */
	validationType?: OTPFieldValidationType;
	/**
	 * Normalizes the OTP value after whitespace and `validationType` filtering.
	 * The result is filtered again, then clamped to `length`. It should be idempotent.
	 */
	normalizeValue?: (value: string) => string;
	/** Whether the user must enter a value before submitting a form. @default false */
	required?: boolean;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean;
	/** Whether the user should be unable to change the field value. @default false */
	readOnly?: boolean;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/**
	 * The OTP value. Use `bind:value` to share it with the parent.
	 * Omit it to leave the field uncontrolled, starting from `defaultValue`.
	 */
	value?: string;
	/** Initial value of an uncontrolled field. Ignored when `value` is passed. */
	defaultValue?: string;
	/**
	 * Called when the OTP value changes. `eventDetails.cancel()` vetoes the change.
	 * `eventDetails.reason` is `input-change`, `input-clear`, `input-paste`, or `keyboard`.
	 */
	onValueChange?: (value: string, eventDetails: OTPFieldChangeEventDetails) => void;
	/**
	 * Called when typed or pasted text contains characters rejected before the value updates.
	 * `value` is the attempted string before normalization.
	 */
	onValueInvalid?: (value: string, eventDetails: OTPFieldInvalidEventDetails) => void;
	/**
	 * Called when the OTP becomes complete, or when a complete value is pasted over a complete OTP.
	 * When the value changes, it runs after that change is stored. `autoSubmit` submits just after.
	 */
	onValueComplete?: (value: string, eventDetails: OTPFieldCompleteEventDetails) => void;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children` inside it. */
	render?: RootRender;
	children?: Snippet;
}

export interface OTPFieldInputProps extends Omit<HTMLInputAttributes, 'children' | 'value'> {
	/** Replace the default `<input>`. Spread `props` onto the host. */
	render?: Snippet<
		[props: HTMLInputAttributes, state: OTPFieldInputState, children: RenderChildren]
	>;
	children?: Snippet;
}
