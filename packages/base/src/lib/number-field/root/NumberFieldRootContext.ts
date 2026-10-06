// Base UI v1.8.0 NumberFieldRootContext, native Svelte context (MIT).
import { getContext, setContext } from 'svelte';
import type {
  NumberFieldRootState,
  NumberFieldRootChangeEventDetails,
  NumberFieldRootCommitEventDetails,
} from '../types.js';
import type { EventWithOptionalKeyState, IncrementValueParameters } from '../utils/types.js';
export type InputMode = 'numeric' | 'decimal' | 'text';
export interface NumberFieldRootContext {
  readonly minWithDefault: number;
  readonly maxWithDefault: number;
  readonly id: string;
  setValue(value: number | null, details: NumberFieldRootChangeEventDetails): boolean;
  getStepAmount(event?: EventWithOptionalKeyState): number;
  incrementValue(amount: number, params: IncrementValueParameters): boolean;
  inputRef: { current: HTMLInputElement | null };
  focusInput(): void;
  allowInputSyncRef: { current: boolean };
  formatOptionsRef: { current: Intl.NumberFormatOptions | undefined };
  valueRef: { current: number | null };
  lastChangedValueRef: { current: number | null };
  hasPendingCommitRef: { current: boolean };
  readonly name: string | undefined;
  readonly nameProp: string | undefined;
  readonly inputMode: InputMode;
  getAllowedNonNumericKeys(): Set<string>;
  readonly min: number | undefined;
  readonly max: number | undefined;
  setInputValue(value: string): void;
  readonly locale: Intl.LocalesArgument | undefined;
  setIsScrubbing(value: boolean): void;
  readonly state: NumberFieldRootState;
  onValueCommitted(value: number | null, details: NumberFieldRootCommitEventDetails): void;
}
const key = Symbol('base-ui-number-field');
export function setNumberFieldRootContext(context: NumberFieldRootContext) {
  setContext(key, context);
}
export function useNumberFieldRootContext(): NumberFieldRootContext {
  const context = getContext<NumberFieldRootContext | undefined>(key);
  if (context === undefined)
    throw new Error(
      'Base UI: NumberFieldRootContext is missing. NumberField parts must be placed within <NumberField.Root>.',
    );
  return context;
}
