import SwitchRoot from './SwitchRoot.svelte';
import SwitchThumb from './SwitchThumb.svelte';

export { SwitchRoot, SwitchThumb };

/** Compound parts matching Base UI `Switch.Root` and `Switch.Thumb`. */
export const Switch = {
	Root: SwitchRoot,
	Thumb: SwitchThumb
};

export type * from './types.js';
