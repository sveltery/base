// Derived from Base UI v1.9.0 packages/react/src/number-field/root/NumberFieldRootContext.ts
// and packages/react/src/number-field/scrub-area/NumberFieldScrubAreaContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { NumberFieldModel } from './model.svelte.js';
import { defineContext } from '../internal/context.js';

export const [useNumberFieldContext, setNumberFieldContext] = defineContext<NumberFieldModel>(
	'Base UI: NumberFieldRootContext is missing. NumberField parts must be placed within <NumberField.Root>.'
);

export class ScrubAreaState {
	scrubbing = $state(false);
	touchInput = $state(false);
	pointerLockDenied = $state(false);
	cursor = $state<HTMLElement | null>(null);
}

export const [useScrubAreaContext, setScrubAreaContext] = defineContext<ScrubAreaState>(
	'Base UI: NumberFieldScrubAreaContext is missing. NumberFieldScrubArea parts must be placed within <NumberField.ScrubArea>.'
);
