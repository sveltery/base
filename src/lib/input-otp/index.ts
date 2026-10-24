import InputOTPRoot from './InputOTPRoot.svelte';

export { InputOTPRoot };

/** Compound parts of the input-otp port. The slots read their state with `getInputOTPContext()`. */
export const InputOTP = {
	Root: InputOTPRoot
};

export { getInputOTPContext } from './context.js';
export { REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from './regexp.js';
export type * from './types.js';
export * from './data-attributes.js';
