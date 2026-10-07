// Derived from Base UI v1.8.0 packages/react/src/number-field/root/NumberFieldRootContext.ts
// and packages/react/src/number-field/scrub-area/NumberFieldScrubAreaContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { NumberFieldModel } from './model.svelte.js';

const NUMBER_FIELD = Symbol('number-field');
const SCRUB_AREA = Symbol('number-field-scrub-area');

export function setNumberFieldContext(model: NumberFieldModel) {
	setContext(NUMBER_FIELD, model);
}

export function useNumberFieldContext() {
	if (!hasContext(NUMBER_FIELD)) {
		throw new Error(
			'Base UI: NumberFieldRootContext is missing. NumberField parts must be placed within <NumberField.Root>.'
		);
	}
	return getContext<NumberFieldModel>(NUMBER_FIELD);
}

export class ScrubAreaState {
	scrubbing = $state(false);
	touchInput = $state(false);
	pointerLockDenied = $state(false);
	cursor = $state<HTMLElement | null>(null);
}

export function setScrubAreaContext(state: ScrubAreaState) {
	setContext(SCRUB_AREA, state);
}

export function useScrubAreaContext() {
	if (!hasContext(SCRUB_AREA)) {
		throw new Error(
			'Base UI: NumberFieldScrubAreaContext is missing. NumberFieldScrubArea parts must be placed within <NumberField.ScrubArea>.'
		);
	}
	return getContext<ScrubAreaState>(SCRUB_AREA);
}
