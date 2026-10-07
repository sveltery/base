// Derived from Base UI v1.8.0 packages/react/src/checkbox/root/CheckboxRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';

const CHECKBOX = Symbol('checkbox');

export interface CheckboxContextValue {
	readonly checked: boolean;
	readonly disabled: boolean;
	readonly readOnly: boolean;
	readonly required: boolean;
	readonly indeterminate: boolean;
}

export function setCheckboxContext(context: CheckboxContextValue) {
	setContext(CHECKBOX, context);
}

export function useCheckboxContext(): CheckboxContextValue {
	const context = getContext<CheckboxContextValue>(CHECKBOX);
	if (context === undefined) {
		throw new Error(
			'Base UI: CheckboxRootContext is missing. Checkbox parts must be placed within <Checkbox.Root>.'
		);
	}
	return context;
}
