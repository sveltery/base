import RadioIndicator from './RadioIndicator.svelte';
import RadioRoot from './RadioRoot.svelte';

export { RadioIndicator, RadioRoot };

/** Compound parts matching Base UI `Radio.Root` and `Radio.Indicator`. */
export const Radio = {
	Root: RadioRoot,
	Indicator: RadioIndicator
};

export type * from './types.js';
