import NumberFieldDecrement from './NumberFieldDecrement.svelte';
import NumberFieldGroup from './NumberFieldGroup.svelte';
import NumberFieldIncrement from './NumberFieldIncrement.svelte';
import NumberFieldInput from './NumberFieldInput.svelte';
import NumberFieldRoot from './NumberFieldRoot.svelte';
import NumberFieldScrubArea from './NumberFieldScrubArea.svelte';
import NumberFieldScrubAreaCursor from './NumberFieldScrubAreaCursor.svelte';

export {
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
	NumberFieldRoot,
	NumberFieldScrubArea,
	NumberFieldScrubAreaCursor
};

/** Compound parts matching Base UI `NumberField`. */
export const NumberField = {
	Root: NumberFieldRoot,
	Group: NumberFieldGroup,
	Input: NumberFieldInput,
	Increment: NumberFieldIncrement,
	Decrement: NumberFieldDecrement,
	ScrubArea: NumberFieldScrubArea,
	ScrubAreaCursor: NumberFieldScrubAreaCursor
};

export type * from './types.js';
