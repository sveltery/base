// Native Svelte public types from Base UI v1.8.0 NumberField (MIT).
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { BaseUIChangeEventDetails, BaseUIGenericEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { FieldRootState } from '../field/types.js';
import type { MergedRef } from '../utils/useMergedRefs.js';
import type { ChangeEventCustomProperties } from './utils/types.js';

export interface NumberFieldRootState extends FieldRootState {
  value: number | null;
  inputValue: string;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  scrubbing: boolean;
}
type PartProps<State, Native> = Omit<WithBaseUIEvent<Native>, 'class' | 'style' | 'children' | 'ref'> & BaseUIComponentProps<State> & {
  children?: Snippet | undefined;
  ref?: HTMLElement | null | undefined;
};
export type NumberFieldRootProps = Omit<PartProps<NumberFieldRootState, HTMLAttributes<HTMLDivElement>>, 'onchange'> & {
  id?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  allowOutOfRange?: boolean | undefined;
  smallStep?: number | undefined;
  step?: number | 'any' | undefined;
  largeStep?: number | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  value?: number | null | undefined;
  defaultValue?: number | undefined;
  allowWheelScrub?: boolean | undefined;
  snapOnStep?: boolean | undefined;
  format?: Intl.NumberFormatOptions | undefined;
  locale?: Intl.LocalesArgument | undefined;
  onValueChange?: ((value: number | null, details: NumberFieldRootChangeEventDetails) => void) | undefined;
  onValueCommitted?: ((value: number | null, details: NumberFieldRootCommitEventDetails) => void) | undefined;
  inputRef?: MergedRef<HTMLInputElement> | null | undefined;
};
export type NumberFieldRootChangeEventReason = 'input-change' | 'input-clear' | 'input-blur' | 'input-paste' | 'keyboard' | 'increment-press' | 'decrement-press' | 'wheel' | 'scrub' | 'none';
export type NumberFieldRootChangeEventDetails = BaseUIChangeEventDetails<NumberFieldRootChangeEventReason, ChangeEventCustomProperties>;
export type NumberFieldRootCommitEventReason = 'input-blur' | 'input-clear' | 'keyboard' | 'increment-press' | 'decrement-press' | 'wheel' | 'scrub' | 'none';
export type NumberFieldRootCommitEventDetails = BaseUIGenericEventDetails<NumberFieldRootCommitEventReason>;
export type NumberFieldInputState = NumberFieldRootState;
export type NumberFieldInputProps = PartProps<NumberFieldInputState, HTMLInputAttributes>;
export type NumberFieldGroupState = NumberFieldRootState;
export type NumberFieldGroupProps = PartProps<NumberFieldGroupState, HTMLAttributes<HTMLDivElement>>;
export type NumberFieldIncrementState = NumberFieldRootState;
export type NumberFieldIncrementProps = Omit<PartProps<NumberFieldIncrementState, HTMLButtonAttributes>, 'disabled'> & { disabled?: boolean | undefined; nativeButton?: boolean | undefined };
export type NumberFieldDecrementState = NumberFieldRootState;
export type NumberFieldDecrementProps = NumberFieldIncrementProps;
export type NumberFieldScrubAreaState = NumberFieldRootState;
export type NumberFieldScrubAreaProps = PartProps<NumberFieldScrubAreaState, HTMLAttributes<HTMLSpanElement>> & {
  direction?: 'horizontal' | 'vertical' | undefined;
  pixelSensitivity?: number | undefined;
  teleportDistance?: number | undefined;
};
export type NumberFieldScrubAreaCursorState = NumberFieldRootState;
export type NumberFieldScrubAreaCursorProps = PartProps<NumberFieldScrubAreaCursorState, HTMLAttributes<HTMLSpanElement>>;
