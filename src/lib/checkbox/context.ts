// Derived from Base UI v1.9.0 packages/react/src/checkbox/root/CheckboxRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { defineContext } from '../internal/context.js';

export interface CheckboxContextValue {
	readonly checked: boolean;
	readonly disabled: boolean;
	readonly readOnly: boolean;
	readonly required: boolean;
	readonly indeterminate: boolean;
}

export const [useCheckboxContext, setCheckboxContext] = defineContext<CheckboxContextValue>(
	'Base UI: CheckboxRootContext is missing. Checkbox parts must be placed within <Checkbox.Root>.'
);
