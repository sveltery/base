// Ported from Base UI v1.8.0 OTPFieldRootContext.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";
import type {
  OTPFieldRootState,
  OTPFieldInputState,
  OTPFieldRootChangeEventDetails,
  OTPFieldRootInvalidEventDetails,
  OTPValidationType,
} from "../types.js";
export interface OTPFieldRootContext {
  readonly activeIndex: number;
  readonly autoComplete: string | undefined;
  readonly disabled: boolean;
  readonly form: string | undefined;
  focusInput(index: number): void;
  queueFocusInput(index: number, value: string): void;
  getInputId(index: number): string | undefined;
  handleInputBlur(event: FocusEvent): void;
  handleInputFocus(index: number, event: FocusEvent): void;
  readonly inputMode: HTMLInputAttributes["inputmode"];
  readonly inputAriaLabelledBy: string | undefined;
  readonly invalid: boolean | undefined;
  readonly length: number;
  readonly mask: boolean;
  readonly pattern: string | undefined;
  reportValueInvalid(
    value: string,
    details: OTPFieldRootInvalidEventDetails,
  ): void;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly normalizeValue: ((value: string) => string) | undefined;
  setValue(
    value: string,
    details: OTPFieldRootChangeEventDetails,
  ): string | null;
  readonly state: OTPFieldRootState;
  readonly validationType: OTPValidationType;
  readonly value: string;
}
const key = Symbol("base-ui-otp-field");
export function setOTPFieldRootContext(value: OTPFieldRootContext) {
  setContext(key, value);
}
export function useOTPFieldRootContext(): OTPFieldRootContext {
  const context = getContext<OTPFieldRootContext | undefined>(key);
  if (context === undefined)
    throw new Error(
      "Base UI: OTPFieldRootContext is missing. OTPField parts must be placed within <OTPField.Root>.",
    );
  return context;
}
export function getOTPFieldInputState(
  state: OTPFieldRootState,
  value: string,
  index: number,
): OTPFieldInputState {
  return { ...state, value, index, filled: value !== "" };
}
