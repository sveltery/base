// Derived from the fields Radio.Root reads in Base UI v1.8.0
// packages/react/src/radio-group/RadioGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// RadioGroup itself is not ported. A later group sets this context.
import { getContext, setContext } from 'svelte';
import type { RadioRootChangeEventDetails } from './types.js';

const RADIO_GROUP = Symbol('radio-group');

export interface RadioGroupContextValue {
	readonly disabled: boolean | undefined;
	readonly readOnly: boolean | undefined;
	readonly required: boolean | undefined;
	readonly form: string | undefined;
	readonly name: string | undefined;
	/**
	 * The selected value. Compare it to a radio's `value` with `===`.
	 * Store it with `$state.raw` so Svelte does not proxy the reference.
	 */
	readonly checkedValue: unknown;
	readonly touched: boolean;
	setCheckedValue: (value: unknown, eventDetails: RadioRootChangeEventDetails) => void;
	setTouched: (touched: boolean) => void;
	registerInput: (element: HTMLInputElement | null) => void | (() => void);
}

export function setRadioGroupContext(context: RadioGroupContextValue) {
	setContext(RADIO_GROUP, context);
}

export function useRadioGroupContext(): RadioGroupContextValue | undefined {
	return getContext<RadioGroupContextValue>(RADIO_GROUP);
}
