import type {
	FieldControlChangeEventDetails,
	FieldControlChangeEventReason,
	FieldControlProps,
	FieldControlState
} from '../field/types.js';

/** Same state `Field.Control` publishes, including validity from `Field.Root`. */
export type InputState = FieldControlState;

export type InputChangeEventReason = FieldControlChangeEventReason;
export type InputChangeEventDetails = FieldControlChangeEventDetails;

/**
 * Props of `Input`. They are `Field.Control`'s props: `bind:value` shares the
 * value, and omitting `value` leaves the input uncontrolled from `defaultValue`.
 */
export type InputProps = FieldControlProps;
