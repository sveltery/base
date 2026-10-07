import MeterIndicator from './MeterIndicator.svelte';
import MeterLabel from './MeterLabel.svelte';
import MeterRoot from './MeterRoot.svelte';
import MeterTrack from './MeterTrack.svelte';
import MeterValue from './MeterValue.svelte';

export const Meter = {
	Root: MeterRoot,
	Track: MeterTrack,
	Indicator: MeterIndicator,
	Value: MeterValue,
	Label: MeterLabel
};

export type * from './types.js';
