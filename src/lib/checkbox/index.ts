import CheckboxIndicator from './CheckboxIndicator.svelte';
import CheckboxRoot from './CheckboxRoot.svelte';

export { CheckboxIndicator, CheckboxRoot };

/** Compound parts matching Base UI `Checkbox.Root` and `Checkbox.Indicator`. */
export const Checkbox = {
	Root: CheckboxRoot,
	Indicator: CheckboxIndicator
};

export type * from './types.js';
