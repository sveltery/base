// Derived from Base UI v1.8.0 packages/react/src/switch/root/SwitchRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
