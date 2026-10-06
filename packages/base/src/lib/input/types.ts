// Derived from Base UI v1.8.0 input/Input.tsx; MIT: THIRD_PARTY_NOTICES.md.
// The Input public contract derives from the real Field.Control port.
import type {
  FieldControlProps,
  FieldControlState,
  FieldControlChangeEventReason,
  FieldControlChangeEventDetails,
} from '../field/types.js';
export type InputProps = FieldControlProps;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve the original InputState interface boundary.
export interface InputState extends FieldControlState {}
export type InputChangeEventReason = FieldControlChangeEventReason;
export type InputChangeEventDetails = FieldControlChangeEventDetails;
