// Derived from Base UI v1.8.0 packages/react/src/radio/root/RadioRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';

const RADIO = Symbol('radio');

export interface RadioContextValue {
	readonly checked: boolean;
	readonly disabled: boolean;
	readonly readOnly: boolean;
	readonly required: boolean;
}

export function setRadioContext(context: RadioContextValue) {
	setContext(RADIO, context);
}

export function useRadioContext(): RadioContextValue {
	const context = getContext<RadioContextValue>(RADIO);
	if (context === undefined) {
		throw new Error(
			'Base UI: RadioRootContext is missing. Radio parts must be placed within <Radio.Root>.'
		);
	}
	return context;
}
