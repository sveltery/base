// Derived from Base UI v1.8.0 packages/react/src/otp-field/root/OTPFieldRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { OTPFieldModel } from './model.svelte.js';
import { defineContext } from '../internal/context.js';

export const [useOTPFieldContext, setOTPFieldContext] = defineContext<OTPFieldModel>(
	'Base UI: OTPFieldRootContext is missing. OTPField parts must be placed within <OTPField.Root>.'
);
