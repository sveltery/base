// Derived from Base UI v1.9.0 packages/react/src/radio/root/RadioRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { defineContext } from '../internal/context.js';

export interface RadioContextValue {
	readonly checked: boolean;
	readonly disabled: boolean;
	readonly readOnly: boolean;
	readonly required: boolean;
}

export const [useRadioContext, setRadioContext] = defineContext<RadioContextValue>(
	'Base UI: RadioRootContext is missing. Radio parts must be placed within <Radio.Root>.'
);
