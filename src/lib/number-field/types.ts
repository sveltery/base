import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
import type {
	BaseUIChangeEventDetails,
	BaseUIGenericEventDetails,
	REASONS
} from '../internal/event-details.js';
import type { FieldRootState } from '../field/types.js';
import type { PartRender, RenderChildren } from '../internal/render-children.js';

export type Direction = -1 | 1;

export type NumberFieldChangeEventReason =
	| typeof REASONS.inputChange
	| typeof REASONS.inputClear
	| typeof REASONS.inputBlur
	| typeof REASONS.inputPaste
	| typeof REASONS.keyboard
	| typeof REASONS.incrementPress
	| typeof REASONS.decrementPress
	| typeof REASONS.wheel
	| typeof REASONS.scrub
	| typeof REASONS.none;

export interface NumberFieldChangeEventDetails extends BaseUIChangeEventDetails<NumberFieldChangeEventReason> {
	direction?: Direction;
}

export type NumberFieldCommitEventReason =
	| typeof REASONS.inputBlur
	| typeof REASONS.inputClear
	| typeof REASONS.keyboard
	| typeof REASONS.incrementPress
	| typeof REASONS.decrementPress
	| typeof REASONS.wheel
	| typeof REASONS.scrub
	| typeof REASONS.none;

export type NumberFieldCommitEventDetails = BaseUIGenericEventDetails<NumberFieldCommitEventReason>;

export interface NumberFieldRootState extends FieldRootState {
	/** The raw numeric value of the field. */
	value: number | null;
	/** The formatted string presented in the input. */
	inputValue: string;
	/** Whether the user must enter a value before submitting a form. */
	required: boolean;
	/** Whether the component should ignore user interaction. */
	disabled: boolean;
	/** Whether the user should be unable to change the field value. */
	readOnly: boolean;
	/** Whether the user is currently scrubbing the field. */
	scrubbing: boolean;
}

export interface NumberFieldRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The id of the input element. */
	id?: string;
	/** The minimum value. */
	min?: number;
	/** The maximum value. */
	max?: number;
	/**
	 * When true, direct text entry may sit outside `min`/`max` so native range
	 * validation can run. Step-based interactions still clamp.
	 * @default false
	 */
	allowOutOfRange?: boolean;
	/**
	 * Step while Alt is held. Also the snap size for Alt when `snapOnStep` is set.
	 * @default 0.1
	 */
	smallStep?: number;
	/**
	 * Amount to increment, decrement, or scrub. `step="any"` disables step
	 * validation and uses `1` for interactive stepping.
	 * @default 1
	 */
	step?: number | 'any';
	/**
	 * Step while Shift is held.
	 * @default 10
	 */
	largeStep?: number;
	/** Whether the user must enter a value before submitting a form. @default false */
	required?: boolean;
	/** Whether the component should ignore user interaction. @default false */
	disabled?: boolean;
	/** Whether the user should be unable to change the field value. @default false */
	readOnly?: boolean;
	/** Identifies the field when a form is submitted. */
	name?: string;
	/** Identifies the form that owns the hidden input. */
	form?: string;
	/**
	 * Raw numeric value. Use `bind:value` to share it with the parent.
	 * Omit it to leave the field uncontrolled, starting from `defaultValue`.
	 */
	value?: number | null;
	/** Initial value of an uncontrolled field. Ignored when `value` is passed. */
	defaultValue?: number | null;
	/**
	 * Whether wheel scrubbing changes the value while the input is focused.
	 * @default false
	 */
	allowWheelScrub?: boolean;
	/** Whether stepping snaps to a multiple of the active step. @default false */
	snapOnStep?: boolean;
	/** Options to format the input value. */
	format?: Intl.NumberFormatOptions;
	/**
	 * Called when the numeric value changes. `eventDetails.cancel()` vetoes the change.
	 * `eventDetails.reason` says what triggered it.
	 */
	onValueChange?: (value: number | null, eventDetails: NumberFieldChangeEventDetails) => void;
	/**
	 * Called when the value is committed: blur after typing, pointer release after
	 * scrubbing or holding a step button, or immediately for keyboard and wheel.
	 */
	onValueCommitted?: (value: number | null, eventDetails: NumberFieldCommitEventDetails) => void;
	/** Locale used to format and parse. Defaults to the runtime locale. */
	locale?: Intl.LocalesArgument;
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, NumberFieldRootState>;
	children?: Snippet;
}

export type NumberFieldGroupState = NumberFieldRootState;

export interface NumberFieldGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Replace the default `<div>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLDivElement, NumberFieldGroupState>;
	children?: Snippet;
}

export type NumberFieldInputState = NumberFieldRootState;

export interface NumberFieldInputProps extends Omit<
	HTMLInputAttributes,
	'children' | 'value' | 'defaultValue'
> {
	/**
	 * Role description for assistive tech. This is not the accessible name.
	 * @default 'Number field'
	 */
	'aria-roledescription'?: HTMLInputAttributes['aria-roledescription'];
	/** Replace the default `<input>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLElement>, state: NumberFieldInputState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type NumberFieldStepperState = NumberFieldRootState;

export interface NumberFieldStepperProps extends Omit<HTMLButtonAttributes, 'children'> {
	/**
	 * Whether the rendered element is a native `<button>`.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Replace the default `<button>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLButtonElement, NumberFieldStepperState>;
	children?: Snippet;
}

export type NumberFieldScrubAreaState = NumberFieldRootState;

export interface NumberFieldScrubAreaProps extends Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children'
> {
	/** Cursor movement direction. @default 'horizontal' */
	direction?: 'horizontal' | 'vertical';
	/**
	 * How many pixels the cursor must move before the value changes.
	 * @default 2
	 */
	pixelSensitivity?: number;
	/**
	 * Distance from the center of the scrub area before the cursor loops.
	 * Omit it to use the visual viewport.
	 */
	teleportDistance?: number;
	/** Replace the default `<span>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLSpanElement, NumberFieldScrubAreaState>;
	children?: Snippet;
}

export type NumberFieldScrubAreaCursorState = NumberFieldRootState;

export interface NumberFieldScrubAreaCursorProps extends Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children'
> {
	/** Replace the default `<span>`. Spread `props` onto the host and render `children`. */
	render?: PartRender<HTMLSpanElement, NumberFieldScrubAreaCursorState>;
	children?: Snippet;
}

export interface EventWithOptionalKeyState {
	altKey?: boolean;
	shiftKey?: boolean;
}

export interface IncrementValueParameters {
	direction: Direction;
	event?: Event;
	reason:
		| typeof REASONS.incrementPress
		| typeof REASONS.decrementPress
		| typeof REASONS.wheel
		| typeof REASONS.scrub
		| typeof REASONS.keyboard;
	currentValue?: number | null;
}
