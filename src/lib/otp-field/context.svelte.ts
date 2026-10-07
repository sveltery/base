// Derived from Base UI v1.8.0 packages/react/src/otp-field/root/OTPFieldRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { OTPFieldModel } from './model.svelte.js';

const OTP_FIELD = Symbol('otp-field');

export function setOTPFieldContext(model: OTPFieldModel) {
	setContext(OTP_FIELD, model);
}

export function useOTPFieldContext() {
	if (!hasContext(OTP_FIELD)) {
		throw new Error(
			'Base UI: OTPFieldRootContext is missing. OTPField parts must be placed within <OTPField.Root>.'
		);
	}
	return getContext<OTPFieldModel>(OTP_FIELD);
}
