// Derived from the fields Radio.Root reads in Base UI v1.8.0
// packages/react/src/radio-group/RadioGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// RadioGroup sets this context. A test harness can set it without roving focus.
import { getContext, setContext } from 'svelte';
import type { RadioRootChangeEventDetails } from './types.js';

const RADIO_GROUP = Symbol('radio-group');

/**
 * Roving tabindex owned by RadioGroup.
 * Arrow keys are handled on the group. Each radio registers its host and reads
 * `tabIndex` from registration order while rendering.
 */
export interface RadioGroupRovingFocus {
	register(element: HTMLElement): () => void;
	highlight(element: HTMLElement): void;
	tabIndex(node: HTMLElement | null, selected: boolean, hasSelection: boolean): 0 | -1;
}

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
	/** Present when the real RadioGroup owns keyboard navigation. */
	readonly roving?: RadioGroupRovingFocus;
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
