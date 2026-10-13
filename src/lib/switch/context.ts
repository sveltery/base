// Derived from Base UI v1.9.0 packages/react/src/switch/root/SwitchRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { defineContext } from '../internal/context.js';

export interface SwitchContextValue {
	readonly checked: boolean;
	readonly disabled: boolean;
	readonly readOnly: boolean;
	readonly required: boolean;
}

export const [useSwitchContext, setSwitchContext] = defineContext<SwitchContextValue>(
	'Base UI: SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.'
);
