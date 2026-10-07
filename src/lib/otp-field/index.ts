import OTPFieldInput from './OTPFieldInput.svelte';
import OTPFieldRoot from './OTPFieldRoot.svelte';
import Separator from '../separator/Separator.svelte';

export { OTPFieldInput, OTPFieldRoot };

/** Compound parts matching Base UI `OTPField`, including `Separator`. */
export const OTPField = {
	Root: OTPFieldRoot,
	Input: OTPFieldInput,
	Separator
};

export type * from './types.js';
