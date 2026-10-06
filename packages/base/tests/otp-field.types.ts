// Type assertion port of pinned Root/Input .spec.tsx; MIT: parity/otp-field/UPSTREAM_LICENSE.
import type { ComponentProps } from 'svelte';
import { OTPField, OTPFieldRoot, OTPFieldInput } from '../src/lib/otp-field/index.js';
import type {
  OTPFieldRootProps,
  OTPFieldInputProps,
  OTPFieldRootChangeEventDetails,
  OTPFieldRootInvalidEventDetails,
  OTPFieldRootCompleteEventDetails,
} from '../src/lib/otp-field/types.js';
const root: OTPFieldRootProps = {
  length: 6,
  form: 'verification-form',
  mask: true,
  validationType: 'alphanumeric',
  normalizeValue: (value) => value.toUpperCase(),
  inputMode: 'tel',
};
const actualRoot: ComponentProps<typeof OTPField.Root> = root;
const input: ComponentProps<typeof OTPField.Input> = {
  readonly: true,
  disabled: false,
  oninput: (event) => event.preventBaseUIHandler(),
};
const actualInput: OTPFieldInputProps = input;
function change(details: OTPFieldRootChangeEventDetails) {
  if (details.reason === 'input-paste') {
    const event: ClipboardEvent = details.event;
    void event;
  }
  if (details.reason === 'keyboard') {
    const event: KeyboardEvent = details.event;
    void event;
  }
  if (details.reason === 'input-change') {
    const event: InputEvent | Event = details.event;
    void event;
  }
  if (details.reason === 'input-clear') {
    const event: InputEvent | FocusEvent | Event = details.event;
    void event;
    // @ts-expect-error keyboard events are not emitted for input-clear
    const keyboardEvent: KeyboardEvent = details.event;
    void keyboardEvent;
  }
}
function generic(details: OTPFieldRootInvalidEventDetails | OTPFieldRootCompleteEventDetails) {
  if (details.reason === 'input-paste') {
    const event: ClipboardEvent = details.event;
    void event;
  }
  if (details.reason === 'input-change') {
    const event: InputEvent | Event = details.event;
    void event;
  }
}
// @ts-expect-error length is required
const missingLength: OTPFieldRootProps = {};
// @ts-expect-error slot order is inferred; no explicit index
const explicitIndex: OTPFieldInputProps = { index: 0 };
const removed: OTPFieldRootProps = {
  length: 6,
  // @ts-expect-error sanitizeValue was renamed to normalizeValue
  sanitizeValue: (value: string) => value,
};
const badValidation: OTPFieldRootProps = {
  length: 6,
  // @ts-expect-error validation type is finite
  validationType: 'decimal',
};
void [
  actualRoot,
  actualInput,
  change,
  generic,
  missingLength,
  explicitIndex,
  removed,
  badValidation,
  OTPFieldRoot,
  OTPFieldInput,
];
