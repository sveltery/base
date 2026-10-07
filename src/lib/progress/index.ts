import ProgressIndicator from './ProgressIndicator.svelte';
import ProgressLabel from './ProgressLabel.svelte';
import ProgressRoot from './ProgressRoot.svelte';
import ProgressTrack from './ProgressTrack.svelte';
import ProgressValue from './ProgressValue.svelte';

export { ProgressRoot, ProgressTrack, ProgressIndicator, ProgressValue, ProgressLabel };

/** Compound parts matching Base UI `Progress.Root`, `Track`, `Indicator`, `Value`, and `Label`. */
export const Progress = {
	Root: ProgressRoot,
	Track: ProgressTrack,
	Indicator: ProgressIndicator,
	Value: ProgressValue,
	Label: ProgressLabel
};

export type * from './types.js';
